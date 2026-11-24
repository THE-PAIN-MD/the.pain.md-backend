
import * as BaileysModule from "@whiskeysockets/baileys";

import pino from "pino";
import QRCode from "qrcode";

import { query } from "../database/pool.js";

import {
  usePostgresAuthState
} from "./postgresAuthState.js";

import {
  normalizePhone
} from "../utils/phone.js";

import {
  handleCommand,
  handleParticipantUpdate
} from "../handler.js";


/* =========================================
   BAILEYS EXPORT COMPATIBILITY
========================================= */

const baileysDefault = BaileysModule.default;

const makeWASocket = [
  BaileysModule.makeWASocket,
  baileysDefault,
  baileysDefault?.default,
  baileysDefault?.makeWASocket
].find(value => typeof value === "function");

const Browsers =
  BaileysModule.Browsers ||
  baileysDefault?.Browsers;

const DisconnectReason =
  BaileysModule.DisconnectReason ||
  baileysDefault?.DisconnectReason;

const fetchLatestBaileysVersion =
  BaileysModule.fetchLatestBaileysVersion ||
  baileysDefault?.fetchLatestBaileysVersion;

if (typeof makeWASocket !== "function") {
  throw new Error(
    "Baileys export error: makeWASocket is not a function. " +
    `Available exports: ${Object.keys(BaileysModule).join(", ")}`
  );
}

if (typeof fetchLatestBaileysVersion !== "function") {
  throw new Error(
    "Baileys export error: fetchLatestBaileysVersion is unavailable."
  );
}

if (!Browsers || typeof Browsers.ubuntu !== "function") {
  throw new Error(
    "Baileys export error: Browsers.ubuntu is unavailable."
  );
}


/* =========================================
   LOGGER AND SESSION STORAGE
========================================= */

const logger = pino({
  level: process.env.LOG_LEVEL || "info"
});

const sessions = new Map();

let baileysVersion = null;
let versionPromise = null;
let shuttingDown = false;


/* =========================================
   PUBLIC SESSION STATE
========================================= */

function publicState(session) {
  return {
    sessionExists: true,
    status: session.status,
    method: session.method,
    qrDataUrl: session.qrDataUrl || undefined,
    pairingCode: session.pairingCode || undefined,
    phone: session.phone || undefined,
    lastError: session.lastError || undefined
  };
}


/* =========================================
   ERROR HANDLING
========================================= */

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error || "Unknown error");
}


/* =========================================
   BAILEYS VERSION
========================================= */

async function getBaileysVersion() {
  if (baileysVersion) {
    return baileysVersion;
  }

  if (!versionPromise) {
    versionPromise = (async () => {
      const result = await fetchLatestBaileysVersion();

      if (
        !result ||
        !Array.isArray(result.version)
      ) {
        throw new Error(
          "Baileys could not retrieve the WhatsApp version."
        );
      }

      baileysVersion = result.version;

      logger.info(
        { version: baileysVersion },
        "Baileys version selected"
      );

      return baileysVersion;
    })().finally(() => {
      versionPromise = null;
    });
  }

  return versionPromise;
}


/* =========================================
   DATABASE STATUS
========================================= */

async function updateDb(
  session,
  status,
  extra = {}
) {
  session.status = status;

  if (extra.error !== undefined) {
    session.lastError = extra.error || null;
  }

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
      extra.error !== undefined
        ? extra.error
        : null
    ]
  );
}


/* =========================================
   SESSION VALIDATION
========================================= */

function isCurrentSocket(session, socket) {
  return (
    sessions.get(session.id) === session &&
    session.socket === socket &&
    !session.stopping
  );
}


/* =========================================
   DEFINITIVE LOGOUT
========================================= */

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

  const socket = session.socket;

  session.socket = null;
  session.connecting = false;

  try {
    socket?.end?.(new Error(reason));
  } catch {}

  sessions.delete(session.id);

  await query(
    "DELETE FROM bot_sessions WHERE id = $1",
    [session.id]
  );

  logger.warn(
    { sessionId: session.id, reason },
    "Definitive logout; session removed"
  );
}


/* =========================================
   SOCKET CONNECTION
========================================= */

async function connectSocket(session) {
  if (
    shuttingDown ||
    session.stopping ||
    session.connecting ||
    sessions.get(session.id) !== session
  ) {
    return;
  }

  session.connecting = true;

  let socket = null;

  try {
    /*
     * 1. Retrieve WhatsApp version.
     */

    const version = await getBaileysVersion();

    if (
      shuttingDown ||
      session.stopping ||
      sessions.get(session.id) !== session
    ) {
      return;
    }

    /*
     * 2. Load this user's credentials.
     */

    const {
      state,
      saveCreds
    } = await usePostgresAuthState(session.id);

    if (
      shuttingDown ||
      session.stopping ||
      sessions.get(session.id) !== session
    ) {
      return;
    }

    session.registered = Boolean(
      state.creds.registered
    );

    /*
     * 3. Create WhatsApp socket.
     */

    socket = makeWASocket({
      version,

      logger: logger.child({
        sessionId: session.id
      }),

      browser: Browsers.ubuntu("Chrome"),

      auth: state,

      printQRInTerminal: false,

      markOnlineOnConnect: true,

      syncFullHistory: false,

      generateHighQualityLinkPreview: false
    });

    session.socket = socket;
    session.qrDataUrl = null;
    session.pairingCode = null;
    session.lastError = null;

    /*
     * 4. Save credentials.
     */

    socket.ev.on("creds.update", async () => {
      if (!isCurrentSocket(session, socket)) {
        return;
      }

      session.registered = Boolean(
        state.creds.registered
      );

      try {
        await saveCreds();
      } catch (error) {
        logger.error(
          {
            err: error,
            sessionId: session.id
          },
          "Could not persist credentials"
        );

        session.lastError = getErrorMessage(error);
      }
    });

    /*
     * 5. Incoming messages.
     */

    socket.ev.on(
      "messages.upsert",
      async ({ messages, type }) => {
        if (
          type !== "notify" ||
          !isCurrentSocket(session, socket)
        ) {
          return;
        }

        for (const message of messages || []) {
          if (!isCurrentSocket(session, socket)) {
            break;
          }

          try {
            await handleCommand(socket, message);
          } catch (error) {
            logger.error(
              {
                err: error,
                sessionId: session.id
              },
              "Message handler failed"
            );
          }
        }
      }
    );

    /*
     * 6. Group participant updates.
     */

    socket.ev.on(
      "group-participants.update",
      async update => {
        if (!isCurrentSocket(session, socket)) {
          return;
        }

        try {
          await handleParticipantUpdate(
            socket,
            update
          );
        } catch (error) {
          logger.error(
            {
              err: error,
              sessionId: session.id
            },
            "Participant handler failed"
          );
        }
      }
    );

    /*
     * 7. Connection events.
     */

    socket.ev.on(
      "connection.update",
      async update => {
        if (!isCurrentSocket(session, socket)) {
          return;
        }

        const {
          connection,
          lastDisconnect,
          qr
        } = update;

        /*
         * QR CODE
         */

        if (qr) {
          try {
            const dataUrl = await QRCode.toDataURL(
              qr,
              {
                errorCorrectionLevel: "M",
                margin: 2,
                width: 320
              }
            );

            if (!isCurrentSocket(session, socket)) {
              return;
            }

            session.qrDataUrl = dataUrl;
            session.pairingCode = null;

            await updateDb(
              session,
              "qr_ready",
              { error: null }
            );
          } catch (error) {
            logger.error(
              {
                err: error,
                sessionId: session.id
              },
              "QR rendering failed"
            );

            session.lastError = getErrorMessage(error);
          }
        }

        /*
         * CONNECTING
         */

        if (connection === "connecting") {
          await updateDb(
            session,
            "connecting",
            { error: null }
          ).catch(error => {
            logger.error(
              {
                err: error,
                sessionId: session.id
              },
              "Could not update connecting status"
            );
          });
        }

        /*
         * CONNECTED
         */

        if (connection === "open") {
          session.retryCount = 0;
          session.qrDataUrl = null;
          session.pairingCode = null;
          session.lastError = null;

          if (session.reconnectTimer) {
            clearTimeout(session.reconnectTimer);
            session.reconnectTimer = null;
          }

          await updateDb(
            session,
            "connected",
            { error: null }
          ).catch(error => {
            logger.error(
              {
                err: error,
                sessionId: session.id
              },
              "Could not update connected status"
            );
          });

          logger.info(
            { sessionId: session.id },
            "WhatsApp session connected"
          );
        }

        /*
         * CONNECTION CLOSED
         */

        if (connection === "close") {
          const statusCode =
            lastDisconnect
              ?.error
              ?.output
              ?.statusCode;

          const reason =
            getErrorMessage(lastDisconnect?.error) ||
            `Socket closed (${statusCode || "unknown"})`;

          session.socket = null;
          session.connecting = false;
          session.qrDataUrl = null;
          session.pairingCode = null;

          /*
           * WhatsApp revoked the linked device.
           */

          if (
            statusCode === DisconnectReason?.loggedOut ||
            statusCode === 401
          ) {
            await deleteDefinitiveSession(
              session,
              reason
            );

            return;
          }

          if (
            shuttingDown ||
            session.stopping
          ) {
            return;
          }

          session.lastError = reason;

          await updateDb(
            session,
            "reconnecting",
            { error: reason }
          ).catch(error => {
            logger.error(
              {
                err: error,
                sessionId: session.id
              },
              "Could not update reconnecting status"
            );
          });

          scheduleReconnect(session);
        }
      }
    );

    /*
     * 8. Initial database status.
     */

    if (!isCurrentSocket(session, socket)) {
      return;
    }

    await updateDb(
      session,
      session.registered
        ? "connecting"
        : "waiting_for_qr",
      { error: null }
    );

    logger.info(
      { sessionId: session.id },
      "WhatsApp socket initialized"
    );

  } catch (error) {
    if (socket) {
      try {
        socket.end();
      } catch {}
    }

    if (session.socket === socket) {
      session.socket = null;
    }

    const reason = getErrorMessage(error);

    session.lastError = reason;

    logger.error(
      {
        err: error,
        sessionId: session.id
      },
      "Socket initialization failed"
    );

    if (
      !shuttingDown &&
      !session.stopping &&
      sessions.get(session.id) === session
    ) {
      await updateDb(
        session,
        "reconnecting",
        { error: reason }
      ).catch(dbError => {
        logger.error(
          {
            err: dbError,
            sessionId: session.id
          },
          "Could not save reconnecting status"
        );
      });
    }

  } finally {
    session.connecting = false;

    /*
     * Retry if initialization failed before
     * a socket was established.
     */

    if (
      !shuttingDown &&
      !session.stopping &&
      sessions.get(session.id) === session &&
      !session.socket &&
      !session.reconnectTimer
    ) {
      scheduleReconnect(session);
    }
  }
}


/* =========================================
   AUTOMATIC RECONNECTION
========================================= */

function scheduleReconnect(session) {
  if (
    shuttingDown ||
    session.stopping ||
    session.reconnectTimer ||
    sessions.get(session.id) !== session
  ) {
    return;
  }

  session.retryCount =
    (session.retryCount || 0) + 1;

  const delay = Math.min(
    30000,
    1000 * (
      2 ** Math.min(
        session.retryCount - 1,
        5
      )
    )
  );

  logger.info(
    {
      sessionId: session.id,
      retry: session.retryCount,
      delay
    },
    "WhatsApp reconnection scheduled"
  );

  session.reconnectTimer = setTimeout(
    async () => {
      session.reconnectTimer = null;

      if (
        shuttingDown ||
        session.stopping ||
        sessions.get(session.id) !== session
      ) {
        return;
      }

      await connectSocket(session);
    },
    delay
  );

  session.reconnectTimer.unref?.();
}


/* =========================================
   CREATE SESSION
========================================= */

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

  const existing = sessions.get(id);

  if (existing && !existing.stopping) {
    if (
      !existing.socket &&
      !existing.connecting &&
      !existing.reconnectTimer
    ) {
      connectSocket(existing).catch(error => {
        logger.error(
          {
            err: error,
            sessionId: existing.id
          },
          "Could not restart existing session"
        );
      });
    }

    return publicState(existing);
  }

  const session = {
    id,
    ownerHash,
    method,

    status: "starting",

    socket: null,

    qrDataUrl: null,
    pairingCode: null,
    phone: null,

    registered: false,

    retryCount: 0,

    connecting: false,
    stopping: false,

    reconnectTimer: null,

    lastError: null
  };

  sessions.set(id, session);

  try {
    await query(
      `INSERT INTO bot_sessions
       (id, owner_token_hash, status, method)
       VALUES ($1, $2, 'starting', $3)`,
      [
        id,
        ownerHash,
        method
      ]
    );
  } catch (error) {
    sessions.delete(id);
    throw error;
  }

  await connectSocket(session);

  return publicState(session);
}


/* =========================================
   RESTORE SAVED SESSIONS
========================================= */

export async function restoreSessions() {
  const result = await query(
    `SELECT
       id,
       owner_token_hash,
       method,
       phone,
       status
     FROM bot_sessions
     ORDER BY created_at ASC`
  );

  let restored = 0;

  for (const row of result.rows) {
    if (sessions.has(row.id)) {
      continue;
    }

    const session = {
      id: row.id,

      ownerHash: row.owner_token_hash,

      method: row.method,

      phone: row.phone,

      status: "reconnecting",

      socket: null,

      qrDataUrl: null,
      pairingCode: null,

      registered: false,

      retryCount: 0,

      connecting: false,
      stopping: false,

      reconnectTimer: null,

      lastError: null
    };

    sessions.set(session.id, session);

    await updateDb(
      session,
      "reconnecting",
      { error: null }
    ).catch(error => {
      logger.error(
        {
          err: error,
          sessionId: session.id
        },
        "Could not update restored session"
      );
    });

    await connectSocket(session);

    restored++;
  }

  logger.info(
    { count: restored },
    "Persisted sessions restored"
  );

  return restored;
}


/* =========================================
   GET SESSION
========================================= */

export async function getSession(id) {
  const session = sessions.get(id);

  return session
    ? publicState(session)
    : null;
}


/* =========================================
   PAIRING CODE
========================================= */

export async function generatePairingCode(
  id,
  phoneInput
) {
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

  if (!session.socket || session.connecting) {
    const error = new Error(
      session.lastError
        ? `WhatsApp is not ready: ${session.lastError}`
        : "WhatsApp is initializing. Try again shortly."
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

  await updateDb(
    session,
    "pairing_code_ready",
    { phone, error: null }
  );

  return publicState(session);
}


/* =========================================
   REFRESH QR
========================================= */

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

  if (
    !session.socket &&
    !session.connecting &&
    !session.reconnectTimer
  ) {
    connectSocket(session).catch(error => {
      logger.error(
        {
          err: error,
          sessionId: session.id
        },
        "QR refresh reconnection failed"
      );
    });
  }

  return publicState(session);
}


/* =========================================
   LOGOUT SESSION
========================================= */

export async function logoutSession(id) {
  const session = sessions.get(id);

  if (!session) {
    await query(
      "DELETE FROM bot_sessions WHERE id = $1",
      [id]
    );

    return { loggedOut: true };
  }

  session.stopping = true;

  if (session.reconnectTimer) {
    clearTimeout(session.reconnectTimer);
    session.reconnectTimer = null;
  }

  const socket = session.socket;
  session.socket = null;

  try {
    if (socket) {
      await socket.logout();
    }
  } catch (error) {
    logger.warn(
      {
        err: error,
        sessionId: id
      },
      "WhatsApp logout request did not complete"
    );
  }

  try {
    socket?.end?.(
      new Error("User requested logout")
    );
  } catch {}

  sessions.delete(id);

  await query(
    "DELETE FROM bot_sessions WHERE id = $1",
    [id]
  );

  return {
    loggedOut: true
  };
}


/* =========================================
   FIND SESSION BY OWNER
========================================= */

export function getLiveSessionByOwner(ownerHash) {
  for (const session of sessions.values()) {
    if (
      session.ownerHash !== ownerHash ||
      session.stopping
    ) {
      continue;
    }

    if (
      !session.socket &&
      !session.connecting &&
      !session.reconnectTimer &&
      !shuttingDown
    ) {
      logger.info(
        { sessionId: session.id },
        "Restarting inactive WhatsApp session"
      );

      connectSocket(session).catch(error => {
        logger.error(
          {
            err: error,
            sessionId: session.id
          },
          "Manual reconnection failed"
        );
      });
    }

    return session;
  }

  return null;
}


/* =========================================
   SERVER SHUTDOWN
========================================= */

export async function shutdownSockets() {
  shuttingDown = true;

  for (const session of sessions.values()) {
    if (session.reconnectTimer) {
      clearTimeout(session.reconnectTimer);
      session.reconnectTimer = null;
    }

    const socket = session.socket;
    session.socket = null;

    try {
      socket?.end?.(
        new Error(
          "Server shutdown; auth is preserved"
        )
      );
    } catch {}
  }

  logger.info(
    "WhatsApp sockets closed; saved sessions preserved"
  );
}
