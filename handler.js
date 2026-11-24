
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import config from "./config.js";

// ==================================================
// 𝐓𝐇𝐄 𝐏𝐀𝐈𝐍 𝐌𝐃 — COMMAND HANDLER
// Version 1.0.0
// ==================================================

const commands = {};
global.commands = commands;

const SETTINGS_FILE = "./data/settings.json";

const SETTING_NAMES = [
  "mutedGroups",
  "antilinkGroups",
  "welcomeGroups",
  "goodbyeGroups",
  "antibotGroups",
  "bannedUsers",
  "sudoUsers"
];

// ==================================================
// CATEGORIES
// ==================================================

const CATEGORY_ORDER = [
  "general",
  "settings",
  "groupe",
  "fun",
  "dark",
  "admin",
  "utility",
  "ai",
  "media",
  "owner"
];

const CATEGORY_LABELS = {
  general: "𝐆𝐄𝐍𝐄𝐑𝐀𝐋",
  settings: "𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒",
  groupe: "𝐆𝐑𝐎𝐔𝐏𝐄",
  fun: "𝐅𝐔𝐍",
  dark: "𝐃𝐀𝐑𝐊",
  admin: "𝐀𝐃𝐌𝐈𝐍",
  utility: "𝐔𝐓𝐈𝐋𝐈𝐓𝐘",
  ai: "𝐀𝐈",
  media: "𝐌𝐄𝐃𝐈𝐀",
  owner: "𝐎𝐖𝐍𝐄𝐑"
};

const CATEGORY_STYLES = {
  general: "⚡",
  settings: "⚙️",
  groupe: "👥",
  fun: "🎭",
  dark: "🩸",
  admin: "🛡️",
  utility: "🔹",
  ai: "🧠",
  media: "🎬",
  owner: "👑"
};

const PAIN = {
  name: config.BOT_NAME || "𝐓𝐇𝐄 𝐏𝐀𝐈𝐍 𝐌𝐃",
  owner: config.OWNER_NAME || "⏤͟͟͞𝐓𝐇𝐄 ➪ 𝐏𝐀𝐈𝐍 ᭄",
  signature: "⏤͟͟͞𝐓𝐇𝐄 ➪ 𝐏𝐀𝐈𝐍 ᭄",

  footer:
    "🩸 𝐓𝐇𝐄 𝐏𝐀𝐈𝐍 𝐌𝐃 🩸"
};

// ==================================================
// SETTINGS STORAGE
// ==================================================

if (!fs.existsSync("./data")) {
  fs.mkdirSync("./data", { recursive: true });
}

if (!fs.existsSync(SETTINGS_FILE)) {
  fs.writeFileSync(
    SETTINGS_FILE,
    JSON.stringify({}, null, 2)
  );
}

function createSettingsStore(saved = {}) {
  const settings = {};

  for (const name of SETTING_NAMES) {
    settings[name] = new Set(
      Array.isArray(saved[name]) ? saved[name] : []
    );
  }

  return settings;
}

const defaultSettings = (() => {
  try {
    const saved = JSON.parse(
      fs.readFileSync(SETTINGS_FILE, "utf8")
    );

    return createSettingsStore(saved);
  } catch {
    return createSettingsStore();
  }
})();

// Compatibilité avec les anciennes commandes.

global.mutedGroups = defaultSettings.mutedGroups;
global.antilinkGroups = defaultSettings.antilinkGroups;
global.welcomeGroups = defaultSettings.welcomeGroups;
global.goodbyeGroups = defaultSettings.goodbyeGroups;
global.antibotGroups = defaultSettings.antibotGroups;
global.bannedUsers = defaultSettings.bannedUsers;
global.sudoUsers = defaultSettings.sudoUsers;

export function createSessionSettings(saved = {}) {
  return createSettingsStore(saved);
}

export function saveSettings(settings = defaultSettings) {
  try {
    const saved = {};

    for (const name of SETTING_NAMES) {
      saved[name] = [...(settings[name] || [])];
    }

    fs.writeFileSync(
      SETTINGS_FILE,
      JSON.stringify(saved, null, 2)
    );
  } catch (err) {
    console.log(
      "🩸 Erreur de sauvegarde :",
      err.message
    );
  }
}

async function persistSessionSettings(
  settings,
  sessionContext
) {
  if (typeof sessionContext.saveSettings === "function") {
    await sessionContext.saveSettings();
    return;
  }

  saveSettings(settings);
}

// ==================================================
// CATEGORY UTILITIES
// ==================================================

function normalizeCategory(category) {
  const value = String(category || "general")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const aliases = {
    group: "groupe",
    groups: "groupe",
    groupe: "groupe",
    general: "general",
    settings: "settings",
    fun: "fun",
    dark: "dark",
    admin: "admin",
    utility: "utility",
    ai: "ai",
    media: "media",
    owner: "owner"
  };

  return aliases[value] || "general";
}

function formatCommandName(name) {
  return String(name || "")
    .trim()
    .toUpperCase();
}

// ==================================================
// AUTOMATIC MENU
// ==================================================

export function getMenu() {
  const grouped = {};

  for (const category of CATEGORY_ORDER) {
    grouped[category] = [];
  }

  for (const command of Object.values(commands)) {
    const category = normalizeCategory(command.category);

    grouped[category].push(command);
  }

  let output = `
╭━━〔 🩸 𝐓𝐇𝐄 𝐏𝐀𝐈𝐍 𝐌𝐃 〕━━╮
│
│ 𝐕𝐄𝐑𝐒𝐈𝐎𝐍 : ${config.VERSION}
│ 𝐃𝐄𝐕 : ${PAIN.owner}
│ 𝐓𝐎𝐓𝐀𝐋 : ${Object.keys(commands).length} COMMANDES
│
╰━━━━━━━━━━━━━━━━━━━━━━╯

`;

  for (const category of CATEGORY_ORDER) {
    const list = grouped[category].sort(
      (a, b) =>
        String(a.name).localeCompare(
          String(b.name),
          "en",
          { sensitivity: "base" }
        )
    );

    const icon = CATEGORY_STYLES[category];
    const label = CATEGORY_LABELS[category];

    output += `
╭━━〔 ${icon} ${label} ${icon} 〕━━╮
`;

    if (list.length === 0) {
      output += "│  Aucune commande disponible\n";
    } else {
      for (const command of list) {
        output +=
          `│ ➤ ${config.PREFIX}${formatCommandName(command.name)}\n`;
      }
    }

    output += "╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n";
  }

  output += `
╭━━〔 🩸 𝐏𝐀𝐈𝐍 𝐒𝐘𝐒𝐓𝐄𝐌 🩸 〕━━╮
│ ${PAIN.signature}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`;

  return output.trim();
}

// ==================================================
// COMMAND LOADER
// ==================================================

function getCommandFiles(directory) {
  const results = [];

  const entries = fs.readdirSync(directory, {
    withFileTypes: true
  });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      results.push(...getCommandFiles(fullPath));
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".js")
    ) {
      results.push(fullPath);
    }
  }

  return results;
}

export async function loadCommands(dir = "./commands") {
  for (const key of Object.keys(commands)) {
    delete commands[key];
  }

  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });

      console.log(
        "⚠️ Dossier commands créé."
      );

      return 0;
    }

    const files = getCommandFiles(dir);

    let count = 0;

    for (const fullPath of files) {
      try {
        const module = await import(
          `${pathToFileURL(path.resolve(fullPath)).href}?update=${Date.now()}`
        );

        const command = module.default;

        if (
          command?.name &&
          typeof command.execute === "function"
        ) {
          const name = String(command.name).toLowerCase();

          if (commands[name]) {
            console.log(
              `⚠️ Commande en double ignorée : ${name}`
            );

            continue;
          }

          commands[name] = {
            ...command,
            category: normalizeCategory(command.category)
          };

          count++;
        } else {
          console.log(
            `⚠️ Commande ignorée : ${fullPath}`
          );
        }
      } catch (err) {
        console.log(
          `❌ Erreur chargement ${fullPath}:`,
          err.message
        );
      }
    }

    global.commands = commands;

    console.log(
      `🩸 ${count} COMMANDES CHARGÉES PAR ${PAIN.name}`
    );

    return count;
  } catch (err) {
    console.log(
      "❌ Erreur lecture commandes:",
      err.message
    );

    return 0;
  }
}

// ==================================================
// MESSAGE UTILITIES
// ==================================================

function unwrapMessage(message) {
  let current = message;

  while (current) {
    const wrapper =
      current.ephemeralMessage?.message ||
      current.viewOnceMessage?.message ||
      current.viewOnceMessageV2?.message ||
      current.viewOnceMessageV2Extension?.message;

    if (!wrapper) break;

    current = wrapper;
  }

  return current || {};
}

function getMessageText(message) {
  const msg = unwrapMessage(message);

  return (
    msg.conversation ||
    msg.extendedTextMessage?.text ||
    msg.imageMessage?.caption ||
    msg.videoMessage?.caption ||
    msg.documentMessage?.caption ||
    msg.buttonsResponseMessage?.selectedButtonId ||
    msg.listResponseMessage?.singleSelectReply?.selectedRowId ||
    msg.templateButtonReplyMessage?.selectedId ||
    msg.interactiveResponseMessage
      ?.nativeFlowResponseMessage?.paramsJson ||
    ""
  );
}

function getSender(mRaw, from) {
  if (from.endsWith("@g.us")) {
    return (
      mRaw.key?.participant ||
      mRaw.participant ||
      from
    );
  }

  return (
    mRaw.key?.participant ||
    mRaw.key?.remoteJid ||
    from
  );
}

function getSenderAliases(mRaw, sender) {
  return [
    sender,
    mRaw.key?.participant,
    mRaw.key?.participantAlt,
    mRaw.key?.remoteJidAlt,
    mRaw.participant,
    mRaw.participantAlt
  ].filter(Boolean);
}

function createMessageWrapper(
  sock,
  mRaw,
  from,
  body
) {
  const isGroup = from.endsWith("@g.us");
  const sender = getSender(mRaw, from);
  const msg = unwrapMessage(mRaw.message);

  const contextInfo =
    msg.extendedTextMessage?.contextInfo ||
    msg.imageMessage?.contextInfo ||
    msg.videoMessage?.contextInfo ||
    msg.documentMessage?.contextInfo ||
    {};

  return {
    ...mRaw,

    chat: from,
    sender,
    senderAliases: getSenderAliases(mRaw, sender),
    isGroup,

    pushName:
      mRaw.pushName ||
      mRaw.verifiedBizName ||
      "Utilisateur",

    body,

    mentionedJid:
      contextInfo.mentionedJid || [],

    quoted: contextInfo.quotedMessage
      ? {
          message: contextInfo.quotedMessage,
          participant: contextInfo.participant,
          stanzaId: contextInfo.stanzaId
        }
      : null,

    reply: async (text) => {
      return sock.sendMessage(
        from,
        { text: String(text) },
        { quoted: mRaw }
      );
    }
  };
}

// ==================================================
// IDENTITY & PERMISSIONS
// ==================================================

function getDigits(value) {
  return String(value || "")
    .split("@")[0]
    .split(":")[0]
    .replace(/\D/g, "");
}

function normalizeJid(value) {
  return String(value || "").trim();
}

function matchesIdentity(list, identities) {
  const values = [...(list || [])];

  for (const identity of identities) {
    const jid = normalizeJid(identity);
    const digits = getDigits(identity);

    if (!jid) continue;

    for (const value of values) {
      const stored = normalizeJid(value);

      if (stored === jid) {
        return true;
      }

      const storedDigits = getDigits(stored);

      if (
        digits &&
        storedDigits &&
        digits === storedDigits
      ) {
        return true;
      }
    }
  }

  return false;
}

function isOwner(mRaw, sender, sessionContext = {}) {
  const identities = getSenderAliases(mRaw, sender);

  const configuredOwners = [
    ...(Array.isArray(config.OWNERS) ? config.OWNERS : []),
    ...(Array.isArray(sessionContext.owners)
      ? sessionContext.owners
      : [])
  ];

  return matchesIdentity(
    configuredOwners,
    identities
  );
}

function isSudo(settings, mRaw, sender) {
  const identities = getSenderAliases(mRaw, sender);

  return matchesIdentity(
    settings.sudoUsers,
    identities
  );
}

function isBanned(settings, mRaw, sender) {
  const identities = getSenderAliases(mRaw, sender);

  return matchesIdentity(
    settings.bannedUsers,
    identities
  );
}

function getCurrentMode(sessionContext) {
  const mode = String(
    sessionContext.mode ||
    sessionContext.botMode ||
    config.MODE ||
    "private"
  ).toLowerCase();

  return mode === "public" ? "public" : "private";
}

// ==================================================
// GROUP ADMIN CHECKS
// ==================================================

function getParticipant(metadata, identities) {
  const participants = metadata?.participants || [];

  return participants.find(participant => {
    const participantIds = [
      participant.id,
      participant.lid,
      participant.phoneNumber
    ].filter(Boolean);

    return participantIds.some(id =>
      identities.some(identity => {
        if (normalizeJid(id) === normalizeJid(identity)) {
          return true;
        }

        const first = getDigits(id);
        const second = getDigits(identity);

        return Boolean(first && second && first === second);
      })
    );
  });
}

async function checkGroupPermissions(
  sock,
  from,
  mRaw,
  sender,
  command
) {
  const metadata = await sock.groupMetadata(from);

  const identities = getSenderAliases(mRaw, sender);

  const actor = getParticipant(metadata, identities);

  const botIdentities = [
    sock.user?.id,
    sock.user?.lid,
    sock.user?.phoneNumber
  ].filter(Boolean);

  const bot = getParticipant(metadata, botIdentities);

  if (command.admin && !actor?.admin) {
    return {
      allowed: false,
      message:
        "🛡️ Les ordres sont réservés aux administrateurs de ce groupe."
    };
  }

  if (command.botAdmin && !bot?.admin) {
    return {
      allowed: false,
      message:
        "🩸 Le pouvoir nécessaire manque. Le compte de 𝐓𝐇𝐄 𝐏𝐀𝐈𝐍 𝐌𝐃 doit être administrateur de ce groupe."
    };
  }

  return {
    allowed: true,
    metadata
  };
}

// ==================================================
// COMMAND HANDLER
// ==================================================

export async function handleCommand(
  sock,
  mRaw,
  sessionContext = {}
) {
  try {
    if (!mRaw?.message) return;

    const from = mRaw.key?.remoteJid;

    if (!from || from === "status@broadcast") {
      return;
    }

    const body = getMessageText(mRaw.message).trim();

    if (!body) return;

    const settings =
      sessionContext.settings || defaultSettings;

    const autoRead =
      sessionContext.autoRead ??
      config.AUTO_READ ??
      false;

    if (autoRead) {
      try {
        await sock.readMessages([mRaw.key]);
      } catch {}
    }

    const prefix =
      sessionContext.prefix ||
      config.PREFIX ||
      ".";

    if (!body.startsWith(prefix)) return;

    const content = body.slice(prefix.length).trim();

    if (!content) return;

    const parts = content.split(/\s+/);

    const commandName = parts.shift()?.toLowerCase();

    if (!commandName) return;

    const args = parts;
    const command = commands[commandName];

    if (!command) return;

    const isGroup = from.endsWith("@g.us");

    const m = createMessageWrapper(
      sock,
      mRaw,
      from,
      body
    );

    const sender = m.sender;

    const owner = isOwner(
      mRaw,
      sender,
      sessionContext
    );

    const sudo = isSudo(
      settings,
      mRaw,
      sender
    );

    // ==============================================
    // MUTED GROUP PROTECTION
    // .unmute remains usable.
    // ==============================================

    if (
      isGroup &&
      settings.mutedGroups.has(from) &&
      commandName !== "unmute" &&
      !command.allowWhenMuted
    ) {
      return;
    }

    // ==============================================
    // BANNED USERS
    // ==============================================

    if (isBanned(settings, mRaw, sender)) {
      return;
    }

    // ==============================================
    // PRIVATE / PUBLIC MODE
    // ==============================================

    const mode = getCurrentMode(sessionContext);

    if (
      mode === "private" &&
      !owner &&
      !sudo
    ) {
      return;
    }

    // ==============================================
    // GROUP ONLY
    // ==============================================

    if (command.groupOnly && !isGroup) {
      return m.reply(
        "🩸 Cette opération ne concerne que les groupes."
      );
    }

    // ==============================================
    // PRIVATE ONLY
    // ==============================================

    if (command.privateOnly && isGroup) {
      return m.reply(
        "☠️ Cette commande doit être utilisée en privé."
      );
    }

    // ==============================================
    // OWNER ONLY
    // ==============================================

    if (command.ownerOnly && !owner) {
      return m.reply(
        `☠️ Accès refusé. Seul ${PAIN.owner} possède cette autorité.`
      );
    }

    // ==============================================
    // SUDO ONLY
    // ==============================================

    if (command.sudoOnly && !owner && !sudo) {
      return m.reply(
        "🩸 Ton autorité ne suffit pas pour cette opération."
      );
    }

    // ==============================================
    // GROUP ADMIN / BOT ADMIN
    // ==============================================

    if (command.admin || command.botAdmin) {
      if (!isGroup) {
        return m.reply(
          "👥 Cette commande nécessite un groupe."
        );
      }

      try {
        const permission = await checkGroupPermissions(
          sock,
          from,
          mRaw,
          sender,
          command
        );

        if (!permission.allowed) {
          return m.reply(permission.message);
        }
      } catch (err) {
        console.log(
          "🩸 Erreur vérification des permissions:",
          err.message
        );

        return m.reply(
          "🩸 Impossible de vérifier les permissions du groupe."
        );
      }
    }

    // ==============================================
    // COMMAND REACTION
    // ==============================================

    try {
      await sock.sendMessage(from, {
        react: {
          text: "🩸",
          key: mRaw.key
        }
      });
    } catch {}

    // ==============================================
    // EXECUTION
    // ==============================================

    try {
      await command.execute(
        sock,
        m,
        args,
        sessionContext
      );

      try {
        await sock.sendMessage(from, {
          react: {
            text: "🩸",
            key: mRaw.key
          }
        });
      } catch {}

      await persistSessionSettings(
        settings,
        sessionContext
      );

    } catch (err) {
      console.log(
        `🩸 Erreur .${commandName}:`,
        err
      );

      try {
        await sock.sendMessage(from, {
          react: {
            text: "❌",
            key: mRaw.key
          }
        });
      } catch {}

      try {
        await m.reply(
          "☠️ L'opération a échoué. Même les ténèbres rencontrent parfois une résistance."
        );
      } catch {}
    }

  } catch (err) {
    console.log(
      "🩸 Handler Fatal Error:",
      err.message
    );
  }
}

// ==================================================
// GROUP PARTICIPANT UPDATES
// WELCOME / GOODBYE
// ==================================================

function getGroupMemberCount(metadata) {
  return metadata?.participants?.length || 0;
}

export async function handleParticipantUpdate(
  sock,
  update,
  sessionContext = {}
) {
  try {
    const {
      id,
      participants,
      action
    } = update;

    const settings =
      sessionContext.settings || defaultSettings;

    if (!id || !id.endsWith("@g.us")) {
      return;
    }

    const metadata = await sock
      .groupMetadata(id)
      .catch(() => null);

    if (!metadata) return;

    const groupName = metadata.subject || "Groupe";

    const memberCount = getGroupMemberCount(metadata);

    // ==============================================
    // WELCOME
    // ==============================================

    if (
      action === "add" &&
      settings.welcomeGroups.has(id)
    ) {
      for (const user of participants || []) {
        const number = getDigits(user);

        await sock.sendMessage(id, {
          text: `
╭━━〔 🩸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 〕━━╮
│
│ ➤ 𝐔𝐒𝐄𝐑 : @${number}
│ ➤ 𝐆𝐑𝐎𝐔𝐏 : ${groupName}
│ ➤ 𝐌𝐄𝐌𝐁𝐄𝐑𝐒 : ${memberCount}
│
│ Une nouvelle présence vient d'entrer.
│ Que le spectacle commence...
│
╰━━━━━━━━━━━━━━━━━━━━━━╯

${PAIN.footer}`,
          mentions: [user]
        });
      }
    }

    // ==============================================
    // GOODBYE
    // ==============================================

    if (
      action === "remove" &&
      settings.goodbyeGroups.has(id)
    ) {
      const botId = sock.user?.id;

      for (const user of participants || []) {
        if (
          botId &&
          getDigits(botId) === getDigits(user)
        ) {
          continue;
        }

        const number = getDigits(user);

        await sock.sendMessage(id, {
          text: `
╭━━〔 ☠️ 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 〕━━╮
│
│ ➤ 𝐔𝐒𝐄𝐑 : @${number}
│ ➤ 𝐆𝐑𝐎𝐔𝐏 : ${groupName}
│ ➤ 𝐌𝐄𝐌𝐁𝐄𝐑𝐒 : ${memberCount}
│
│ Une présence de moins.
│ Le groupe continue sans attendre.
│
╰━━━━━━━━━━━━━━━━━━━━━━╯

${PAIN.footer}`,
          mentions: [user]
        });
      }
    }

  } catch (err) {
    console.log(
      "🩸 Participant Update:",
      err.message
    );
  }
}

// ==================================================
// EXPORTS
// ==================================================

export { commands };

export default handleCommand;
