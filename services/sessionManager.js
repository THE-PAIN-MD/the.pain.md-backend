
import * as baileys from "@whiskeysockets/baileys";
import pino from "pino";
import QRCode from "qrcode";

import { query } from "../database/pool.js";
import { usePostgresAuthState } from "./postgresAuthState.js";
import { normalizePhone } from "../utils/phone.js";

import {
  handleCommand,
  handleParticipantUpdate,
  createSessionSettings
} from "../handler.js";

const makeWASocket =
  typeof baileys.default === "function"
    ? baileys.default
    : typeof baileys.makeWASocket === "function"
      ? baileys.makeWASocket
      : typeof baileys.default?.default === "function"
        ? baileys.default.default
        : null;

const {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion
} = baileys;

if (typeof makeWASocket !== "function") {
  throw new TypeError("Baileys: makeWASocket introuvable.");
}

if (
  !Browsers ||
  !DisconnectReason ||
  typeof fetchLatestBaileysVersion !== "function"
) {
  throw new Error("Baileys: exports nécessaires manquants.");
}

const logger = pino({
  level: process.env.LOG_LEVEL || "info"
});

const sessions = new Map();

let baileysVersion = null;
let shuttingDown = false;
let restorePromise = null;

const SETTING_NAMES = [
  "mutedGroups",
  "antilinkGroups",
  "antispamGroups",
  "antibotGroups",
  "antifakeGroups",
  "autotypingChats",
  "autorecordingChats",
  "autoreactChats",
  "welcomeGroups",
  "goodbyeGroups",
  "bannedUsers",
  "sudoUsers"
];

function serializeSettings(settings = {}) {
  const output = {};

  for (const name of SETTING_NAMES) {
    output[name] = [...(settings[name] || [])];
  }

  return output;
}

async function saveSessionSettings(session) {
  const saved = {
    ...serializeSettings(session.settings),
    mode: session.mode === "public" ? "public" : "private"
  };

  await query(
    `UPDATE bot_sessions
     SET settings = $2::jsonb,
         updated_at = NOW()
     WHERE id = $1`,
    [session.id, JSON.stringify(saved)]
  );
}

async function loadSessionSettings(session, saved = {}) {
  const data =
    saved && typeof saved === "object" ? saved : {};

  session.settings = createSessionSettings(data);

  session.mode = data.mode === "public" ? "public" : "private";
  session.botMode = session.mode;
  session.sessionId = session.id;

  session.saveSettings = async () => {
    await saveSessionSettings(session);
  };
}

function publicState(session) {
  return {
    sessionExists: true,
    status: session.status,
    method: session.method,
    qrDataUrl: session.qrDataUrl || undefined,
    pairingCode: session.pairingCode || undefined,
    phone: session.phone || undefined
  };
}

async function updateDb(session, status, extra = {}) {
  session.status = status;

  await query(
    `UPDATE bot_sessions
     SET status = $2,
         phone = COALESCE($3, phone),
         updated_at = NOW(),
         last_connected_at =
           CASE
             WHEN $2 = 'connected' THEN NOW()
             ELSE last_connected_at
           END,
         last_error = $4
     WHERE id = $1`,
    [
      session.id,
      status,
      extra.phone || null,
      extra.error || null
    ]
  );
}

function getDisconnectCode(error) {
  return error?.output?.statusCode ||
    error?.data?.statusCode ||
    error?.statusCode ||
    null;
}

function isConnectionReplaced(error) {
  const code = getDisconnectCode(error);

  return (
    code === DisconnectReason.connectionReplaced ||
    code === 440
  );
}

function rememberSessionOwner(session, sock) {
  const user = sock.user || {};

  const identities = [
    user.id,
    user.lid,
    user.phoneNumber
  ].filter(Boolean);

  session.owners = [...new Set(identities)];

  const primary = user.id || user.phoneNumber;

  if (primary) {
    session.phone = String(primary)
      .split("@")[0]
      .split(":")[0]
      .replace(/\D/g, "");
  }

  logger.info(
    {
      sessionId: session.id,
      ownerIdentitiesFound: session.owners.length
    },
    "Session owner identified"
  );
}

async function deleteDefinitiveSession(
  session,
  reason = "WhatsApp logged out"
) {
  if (session.stopping) return;

  session.stopping = true;
  session.status = "logged_out";

  if (session.reconnectTimer) {
    clearTimeout(session.reconnectTimer);
    session.reconnectTimer = null;
  }

  try {
    session.socket?.end?.(new Error(reason));
  } catch {}

  sessions.delete(session.id);

  await query(
    "DELETE FROM bot_sessions WHERE id = $1",
    [session.id]
  );

  logger.warn(
    { sessionId: session.id },
    "Definitive logout; auth data deleted"
  );
}

async function connectSocket(session) {
  if (
    shuttingDown ||
    session.stopping ||
    session.connecting ||
    session.status === "conflict"
  ) {
    return;
  }

  session.connecting = true;

  const connectionId = Symbol("connection");
  session.connectionId = connectionId;

  try {
    if (!baileysVersion) {
      const latest = await fetchLatestBaileysVersion();
      baileysVersion = latest.version;

      logger.info(
        { version: baileysVersion },
        "Baileys version selected"
      );
    }

    if (
      session.stopping ||
      session.connectionId !== connectionId
    ) {
      session.connecting = false;
      return;
    }

    const { state, saveCreds } =
      await usePostgresAuthState(session.id);

    if (
      session.stopping ||
      session.connectionId !== connectionId
    ) {
      session.connecting = false;
      return;
    }

    const sock = makeWASocket({
      version: baileysVersion,
      logger: logger.child({ sessionId: session.id }),
      browser: Browsers.ubuntu("Chrome"),
      auth: state,
      printQRInTerminal: false,
      markOnlineOnConnect: true,
      syncFullHistory: false,
      generateHighQualityLinkPreview: false
    });

    session.socket = sock;
    session.registered = Boolean(state.creds.registered);
    session.qrDataUrl = null;
    session.connecting = false;

    await updateDb(
      session,
      state.creds.registered ? "connecting" : "waiting_for_qr"
    );

    sock.ev.on("creds.update", async () => {
      session.registered = Boolean(state.creds.registered);

      try {
        await saveCreds();
      } catch (error) {
        logger.error(
          { err: error, sessionId: session.id },
          "Could not persist credentials"
        );
      }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (
        session.socket !== sock ||
        session.stopping ||
        type !== "notify"
      ) {
        return;
      }

      for (const message of messages || []) {
        if (
          session.socket !== sock ||
          session.stopping
        ) {
          break;
        }

        try {
          await handleCommand(sock, message, session);
        } catch (error) {
          logger.error(
            { err: error, sessionId: session.id },
            "Message handler failed"
          );
        }
      }
    });

    sock.ev.on("group-participants.update", async update => {
      if (
        session.socket !== sock ||
        session.stopping
      ) {
        return;
      }

      try {
        await handleParticipantUpdate(sock, update, session);
      } catch (error) {
        logger.error(
          { err: error, sessionId: session.id },
          "Participant handler failed"
        );
      }
    });

    sock.ev.on("connection.update", async update => {
      if (
        session.socket !== sock ||
        session.stopping ||
        session.connectionId !== connectionId
      ) {
        return;
      }

      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          session.qrDataUrl = await QRCode.toDataURL(qr, {
            errorCorrectionLevel: "M",
            margin: 2,
            width: 320
          });

          await updateDb(session, "qr_ready");
        } catch (error) {
          logger.error(
            { err: error, sessionId: session.id },
            "QR rendering failed"
          );
        }
      }

      if (connection === "connecting") {
        await updateDb(session, "connecting").catch(() => {});
      }

      if (connection === "open") {
        session.retryCount = 0;
        session.qrDataUrl = null;
        session.pairingCode = null;
        session.registered = true;

        rememberSessionOwner(session, sock);

        await updateDb(
          session,
          "connected",
          { phone: session.phone }
        );

        logger.info(
          { sessionId: session.id },
          "WhatsApp session connected"
        );
      }

      if (connection === "close") {
        const error = lastDisconnect?.error;
        const statusCode = getDisconnectCode(error);

        if (
          statusCode === DisconnectReason.loggedOut ||
          statusCode === 401
        ) {
          await deleteDefinitiveSession(
            session,
            "WhatsApp revoked the linked device"
          );
          return;
        }

        if (isConnectionReplaced(error)) {
          session.status = "conflict";
          session.connecting = false;
          session.reconnectTimer = null;

          await updateDb(session, "conflict", {
            error: "WhatsApp connection replaced by another socket."
          }).catch(() => {});

          logger.error(
            { sessionId: session.id, statusCode },
            "Connection conflict detected; automatic reconnect paused"
          );

          return;
        }

        if (shuttingDown || session.stopping) return;

        await updateDb(session, "reconnecting", {
          error: error?.message ||
            `Socket closed (${statusCode || "unknown"})`
        }).catch(() => {});

        scheduleReconnect(session);
      }
    });
  } catch (error) {
    session.connecting = false;

    logger.error(
      { err: error, sessionId: session.id },
      "Socket initialization failed"
    );

    await updateDb(session, "reconnecting", {
      error: error.message
    }).catch(() => {});

    scheduleReconnect(session);
  }
}

function scheduleReconnect(session) {
  if (
    shuttingDown ||
    session.stopping ||
    session.status === "conflict" ||
    session.reconnectTimer
  ) {
    return;
  }

  session.retryCount = (session.retryCount || 0) + 1;

  const delay = Math.min(
    30000,
    1000 * (2 ** Math.min(session.retryCount - 1, 5))
  );

  session.reconnectTimer = setTimeout(async () => {
    session.reconnectTimer = null;

    if (
      shuttingDown ||
      session.stopping ||
      sessions.get(session.id) !== session
    ) {
      return;
    }

    await connectSocket(session);
  }, delay);

  session.reconnectTimer.unref?.();
}

function createSessionObject({
  id,
  ownerHash,
  method,
  phone = null
}) {
  return {
    id,
    ownerHash,
    method,
    phone,
    status: "starting",

    socket: null,
    qrDataUrl: null,
    pairingCode: null,

    owners: [],
    registered: false,

    retryCount: 0,
    connecting: false,
    stopping: false,
    reconnectTimer: null,
    connectionId: null,

    settings: null,
    mode: "private",
    botMode: "private",
    sessionId: id
  };
}

export async function createSession({
  id,
  ownerHash,
  method
}) {
  if (!["qr", "pair"].includes(method)) {
    const error = new Error(
      "Connection method must be qr or pair."
    );
    error.status = 400;
    throw error;
  }

  if (sessions.has(id)) {
    const error = new Error(
      "This session is already active."
    );
    error.status = 409;
    throw error;
  }

  const session = createSessionObject({
    id,
    ownerHash,
    method
  });

  await query(
    `INSERT INTO bot_sessions
     (id, owner_token_hash, status, method)
     VALUES ($1, $2, 'starting', $3)`,
    [id, ownerHash, method]
  );

  await loadSessionSettings(session);

  sessions.set(id, session);

  await connectSocket(session);

  return publicState(session);
}

export async function restoreSessions() {
  if (restorePromise) return restorePromise;

  restorePromise = (async () => {
    const result = await query(
      `SELECT
         id,
         owner_token_hash,
         method,
         phone,
         status,
         settings
       FROM bot_sessions
       ORDER BY created_at ASC`
    );

    for (const row of result.rows) {
      if (shuttingDown || sessions.has(row.id)) continue;

      const session = createSessionObject({
        id: row.id,
        ownerHash: row.owner_token_hash,
        method: row.method,
        phone: row.phone
      });

      await loadSessionSettings(
        session,
        row.settings || {}
      );

      sessions.set(session.id, session);

      await updateDb(session, "reconnecting");

      await connectSocket(session);
    }

    logger.info(
      { count: result.rowCount },
      "Persisted sessions restored"
    );
  })();

  try {
    await restorePromise;
  } finally {
    restorePromise = null;
  }
}

export async function getSession(id) {
  const session = sessions.get(id);
  return session ? publicState(session) : null;
}

export async function generatePairingCode(id, phoneInput) {
  const session = sessions.get(id);

  if (!session || session.stopping) {
    const error = new Error(
      "No active session. Create a new session first."
    );
    error.status = 404;
    throw error;
  }

  if (session.method !== "pair") {
    const error = new Error(
      "This session was created using QR Code."
    );
    error.status = 409;
    throw error;
  }

  const phone = normalizePhone(phoneInput);

  if (!session.socket) {
    const error = new Error(
      "WhatsApp is initializing. Try again shortly."
    );
    error.status = 503;
    throw error;
  }

  if (session.registered) {
    const error = new Error(
      "This WhatsApp session is already registered."
    );
    error.status = 409;
    throw error;
  }

  const code =
    await session.socket.requestPairingCode(phone);

  session.phone = phone;
  session.pairingCode = code;

  await updateDb(session, "pairing_code_ready", { phone });

  return publicState(session);
}

export async function refreshQr(id) {
  const session = sessions.get(id);

  if (!session || session.stopping) {
    const error = new Error(
      "No active session. Create a new session first."
    );
    error.status = 404;
    throw error;
  }

  if (session.method !== "qr") {
    const error = new Error(
      "This session uses Pairing Code."
    );
    error.status = 409;
    throw error;
  }

  return publicState(session);
}

export async function logoutSession(id) {
  const session = sessions.get(id);

  if (!session) {
    return { loggedOut: true };
  }

  session.stopping = true;

  if (session.reconnectTimer) {
    clearTimeout(session.reconnectTimer);
    session.reconnectTimer = null;
  }

  try {
    if (session.socket) {
      await session.socket.logout();
    }
  } catch (error) {
    logger.warn(
      { err: error, sessionId: id },
      "WhatsApp logout request did not complete"
    );
  }

  try {
    session.socket?.end?.(
      new Error("User requested logout")
    );
  } catch {}

  sessions.delete(id);

  await query(
    "DELETE FROM bot_sessions WHERE id = $1",
    [id]
  );

  return { loggedOut: true };
}

export function getLiveSessionByOwner(ownerHash) {
  for (const session of sessions.values()) {
    if (
      session.ownerHash === ownerHash &&
      !session.stopping
    ) {
      return session;
    }
  }

  return null;
}

export async function shutdownSockets() {
  shuttingDown = true;

  for (const session of sessions.values()) {
    session.stopping = true;

    if (session.reconnectTimer) {
      clearTimeout(session.reconnectTimer);
      session.reconnectTimer = null;
    }

    try {
      session.socket?.end?.(
        new Error("Server shutdown; auth is preserved")
      );
    } catch {}
  }
}
