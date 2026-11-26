
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import config from "./config.js";

const commands = {};
global.commands = commands;

const SETTINGS_FILE = "./data/settings.json";

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

const CATEGORY_ORDER = [
  "general", "settings", "groupe", "fun", "dark",
  "admin", "utility", "ai", "media", "owner"
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
  footer: "🩸 𝐓𝐇𝐄 𝐏𝐀𝐈𝐍 𝐌𝐃 🩸"
};

if (!fs.existsSync("./data")) {
  fs.mkdirSync("./data", { recursive: true });
}

if (!fs.existsSync(SETTINGS_FILE)) {
  fs.writeFileSync(SETTINGS_FILE, "{}");
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
    return createSettingsStore(
      JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8"))
    );
  } catch {
    return createSettingsStore();
  }
})();

for (const name of SETTING_NAMES) {
  global[name] = defaultSettings[name];
}

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
    console.log("🩸 Erreur de sauvegarde :", err.message);
  }
}

async function persistSessionSettings(settings, sessionContext) {
  if (typeof sessionContext.saveSettings === "function") {
    await sessionContext.saveSettings();
  } else {
    saveSettings(settings);
  }
}

function normalizeCategory(category) {
  const value = String(category || "general")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const aliases = {
    group: "groupe",
    groups: "groupe",
    groupe: "groupe"
  };

  return aliases[value] || (
    CATEGORY_ORDER.includes(value) ? value : "general"
  );
}

export function getMenu() {
  const grouped = {};

  for (const category of CATEGORY_ORDER) {
    grouped[category] = [];
  }

  for (const command of Object.values(commands)) {
    grouped[normalizeCategory(command.category)].push(command);
  }

  let output = "";

  for (const category of CATEGORY_ORDER) {
    const list = grouped[category].sort((a, b) =>
      String(a.name).localeCompare(String(b.name))
    );

    const emoji = CATEGORY_STYLES[category];
    const label = CATEGORY_LABELS[category];

    output += `\n╭─❖ ${emoji} ${label} ${emoji} ❖─╮\n`;

    if (!list.length) {
      output += "│ Aucune commande disponible\n";
    } else {
      for (const command of list) {
        output += `│ ͟͟͞ᬼ⃟─► ${config.PREFIX}${command.name.toLowerCase()}\n`;
      }
    }

    output += "╰─────────────❖\n";
  }

  return output.trim();
}

function getCommandFiles(directory) {
  const results = [];

  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true
  })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      results.push(...getCommandFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
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
      return 0;
    }

    let count = 0;

    for (const fullPath of getCommandFiles(dir)) {
      try {
        const module = await import(
          `${pathToFileURL(path.resolve(fullPath)).href}?update=${Date.now()}`
        );

        const command = module.default;

        if (!command?.name || typeof command.execute !== "function") {
          continue;
        }

        const name = String(command.name).toLowerCase();

        if (commands[name]) {
          console.log(`⚠️ Commande en double ignorée : ${name}`);
          continue;
        }

        commands[name] = {
          ...command,
          category: normalizeCategory(command.category)
        };

        count++;
      } catch (err) {
        console.log(`❌ Erreur chargement ${fullPath}:`, err.message);
      }
    }

    global.commands = commands;
    console.log(`🩸 ${count} COMMANDES CHARGÉES PAR ${PAIN.name}`);

    return count;
  } catch (err) {
    console.log("❌ Erreur lecture commandes:", err.message);
    return 0;
  }
}

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
    msg.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson ||
    ""
  );
}

function getDigits(value) {
  return String(value || "")
    .split("@")[0]
    .split(":")[0]
    .replace(/\D/g, "");
}

function getSender(mRaw, from) {
  if (from.endsWith("@g.us")) {
    return mRaw.key?.participant || mRaw.participant || from;
  }

  return mRaw.key?.participant || mRaw.key?.remoteJid || from;
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

function createMessageWrapper(sock, mRaw, from, body) {
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
    pushName: mRaw.pushName || mRaw.verifiedBizName || "Utilisateur",
    body,
    mentionedJid: contextInfo.mentionedJid || [],
    quoted: contextInfo.quotedMessage
      ? {
          message: contextInfo.quotedMessage,
          participant: contextInfo.participant,
          stanzaId: contextInfo.stanzaId
        }
      : null,
    reply: async text => {
      return sock.sendMessage(
        from,
        { text: String(text) },
        { quoted: mRaw }
      );
    }
  };
}

function matchesIdentity(list, identities) {
  for (const identity of identities) {
    const jid = String(identity || "").trim();
    const digits = getDigits(identity);

    for (const value of list || []) {
      const stored = String(value || "").trim();

      if (stored === jid) return true;

      const storedDigits = getDigits(stored);

      if (digits && storedDigits && digits === storedDigits) {
        return true;
      }
    }
  }

  return false;
}

/*
 * Le compte WhatsApp connecté est propriétaire de sa session.
 * Les autres identités autorisées peuvent être ajoutées dans sessionContext.owners.
 */
function isOwner(mRaw, sender, sessionContext = {}) {
  if (mRaw?.key?.fromMe === true) {
    return true;
  }

  const identities = getSenderAliases(mRaw, sender);

  const owners = [
    ...(Array.isArray(config.OWNERS) ? config.OWNERS : []),
    ...(Array.isArray(sessionContext.owners)
      ? sessionContext.owners
      : [])
  ];

  return matchesIdentity(owners, identities);
}

function isSudo(settings, mRaw, sender) {
  return matchesIdentity(
    settings.sudoUsers,
    getSenderAliases(mRaw, sender)
  );
}

function isBanned(settings, mRaw, sender) {
  return matchesIdentity(
    settings.bannedUsers,
    getSenderAliases(mRaw, sender)
  );
}

function getParticipant(metadata, identities) {
  return (metadata?.participants || []).find(participant => {
    const ids = [
      participant.id,
      participant.lid,
      participant.phoneNumber
    ].filter(Boolean);

    return ids.some(id =>
      identities.some(identity => {
        if (String(id) === String(identity)) return true;

        const first = getDigits(id);
        const second = getDigits(identity);

        return Boolean(first && second && first === second);
      })
    );
  });
}

async function getGroupRoles(sock, from, mRaw, sender) {
  const metadata = await sock.groupMetadata(from);

  const actor = getParticipant(
    metadata,
    getSenderAliases(mRaw, sender)
  );

  const bot = getParticipant(metadata, [
    sock.user?.id,
    sock.user?.lid,
    sock.user?.phoneNumber
  ].filter(Boolean));

  return {
    metadata,
    actorAdmin: Boolean(actor?.admin),
    botAdmin: Boolean(bot?.admin)
  };
}

function getCurrentMode(sessionContext = {}) {
  const mode = String(
    sessionContext.mode ||
    sessionContext.botMode ||
    config.MODE ||
    "private"
  ).toLowerCase();

  return mode === "public" ? "public" : "private";
}

const spamState = new Map();

async function handleAutomaticFeatures(
  sock,
  mRaw,
  from,
  body,
  settings,
  sessionContext
) {
  const isGroup = from.endsWith("@g.us");
  const sender = getSender(mRaw, from);
  const identities = getSenderAliases(mRaw, sender);

  const owner = isOwner(mRaw, sender, sessionContext);
  const sudo = isSudo(settings, mRaw, sender);

  let roles = {
    metadata: null,
    actorAdmin: false,
    botAdmin: false
  };

  const needsMetadata = isGroup && (
    settings.antilinkGroups.has(from) ||
    settings.antispamGroups.has(from) ||
    settings.antibotGroups.has(from) ||
    [...settings.antifakeGroups].some(item => item.startsWith(`${from}|`))
  );

  if (needsMetadata) {
    try {
      roles = await getGroupRoles(sock, from, mRaw, sender);
    } catch {}
  }

  const exempt = owner || sudo || roles.actorAdmin;

  if (
    isGroup &&
    settings.antilinkGroups.has(from) &&
    !exempt &&
    /(https?:\/\/|www\.|chat\.whatsapp\.com\/|wa\.me\/)/i.test(body)
  ) {
    if (roles.botAdmin) {
      try {
        await sock.sendMessage(from, { delete: mRaw.key });
        await sock.sendMessage(from, {
          text: "🛡️ Les liens sont interdits aux membres. Les administrateurs sont exemptés."
        });
      } catch {}
    }

    return true;
  }

  if (
    isGroup &&
    settings.antispamGroups.has(from) &&
    !exempt
  ) {
    const key = `${sessionContext.sessionId || "default"}:${from}:${sender}`;
    const now = Date.now();

    const recent = (spamState.get(key) || [])
      .filter(time => now - time < 5000);

    recent.push(now);
    spamState.set(key, recent);

    if (recent.length > 5 && roles.botAdmin) {
      try {
        await sock.sendMessage(from, { delete: mRaw.key });
        await sock.sendMessage(from, {
          text: "🛡️ Ralentis : trop de messages envoyés en quelques secondes."
        });
      } catch {}

      return true;
    }
  }

  if (
    isGroup &&
    settings.antibotGroups.has(from) &&
    !exempt &&
    roles.botAdmin
  ) {
    const participant = getParticipant(roles.metadata, identities);

    if (participant?.isBot === true) {
      try {
        await sock.sendMessage(from, { delete: mRaw.key });
      } catch {}

      return true;
    }
  }

  if (isGroup && roles.botAdmin && !exempt) {
    const rule = [...settings.antifakeGroups].find(
      item => item.startsWith(`${from}|`)
    );

    if (rule) {
      const allowedPrefix = rule.split("|")[1];
      const number = getDigits(sender);

      if (
        allowedPrefix &&
        number &&
        !number.startsWith(allowedPrefix)
      ) {
        try {
          await sock.sendMessage(from, { delete: mRaw.key });
        } catch {}

        return true;
      }
    }
  }

  if (settings.autotypingChats.has(from)) {
    try {
      await sock.sendPresenceUpdate("composing", from);
    } catch {}
  }

  if (settings.autorecordingChats.has(from)) {
    try {
      await sock.sendPresenceUpdate("recording", from);
    } catch {}
  }

  if (settings.autoreactChats.has(from)) {
    const reactions = ["❤️", "🔥", "✨", "💯", "🩸", "⚡", "👀"];
    const reaction = reactions[
      Math.floor(Math.random() * reactions.length)
    ];

    try {
      await sock.sendMessage(from, {
        react: {
          text: reaction,
          key: mRaw.key
        }
      });
    } catch {}
  }

  return false;
}

async function checkCommandPermissions(
  sock,
  from,
  mRaw,
  sender,
  command
) {
  const roles = await getGroupRoles(sock, from, mRaw, sender);

  if (command.admin && !roles.actorAdmin) {
    return {
      allowed: false,
      message: "🛡️ Cette commande est réservée aux administrateurs."
    };
  }

  if (command.botAdmin && !roles.botAdmin) {
    return {
      allowed: false,
      message: "🩸 Le compte de 𝐓𝐇𝐄 𝐏𝐀𝐈𝐍 𝐌𝐃 doit être administrateur."
    };
  }

  return { allowed: true };
}

function findCommand(name) {
  const direct = commands[name];
  if (direct) return direct;

  return Object.values(commands).find(command =>
    Array.isArray(command.aliases) &&
    command.aliases.some(alias =>
      String(alias).toLowerCase() === name
    )
  );
}

export async function handleCommand(
  sock,
  mRaw,
  sessionContext = {}
) {
  try {
    if (!mRaw?.message) return;

    const from = mRaw.key?.remoteJid;

    if (!from || from === "status@broadcast") return;

    const body = getMessageText(mRaw.message).trim();
    if (!body) return;

    const settings = sessionContext.settings || createSessionSettings();

    const autoRead =
      sessionContext.autoRead ??
      config.AUTO_READ ??
      false;

    if (autoRead) {
      try {
        await sock.readMessages([mRaw.key]);
      } catch {}
    }

    const blocked = await handleAutomaticFeatures(
      sock,
      mRaw,
      from,
      body,
      settings,
      sessionContext
    );

    if (blocked) return;

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
    const command = findCommand(commandName);
    if (!command) return;

    const isGroup = from.endsWith("@g.us");
    const m = createMessageWrapper(sock, mRaw, from, body);
    const sender = m.sender;

    const owner = isOwner(mRaw, sender, sessionContext);
    const sudo = isSudo(settings, mRaw, sender);

    if (
      isGroup &&
      settings.mutedGroups.has(from) &&
      commandName !== "unmute" &&
      !command.allowWhenMuted
    ) {
      return;
    }

    if (isBanned(settings, mRaw, sender)) return;

    if (
      getCurrentMode(sessionContext) === "private" &&
      !owner &&
      !sudo
    ) {
      return;
    }

    if (command.groupOnly && !isGroup) {
      return m.reply("🩸 Cette opération ne concerne que les groupes.");
    }

    if (command.privateOnly && isGroup) {
      return m.reply("☠️ Cette commande doit être utilisée en privé.");
    }

    if (command.ownerOnly && !owner) {
      return m.reply(
        `☠️ Accès refusé. Seul ${PAIN.owner} possède cette autorité.`
      );
    }

    if (command.sudoOnly && !owner && !sudo) {
      return m.reply("🩸 Ton autorité ne suffit pas pour cette opération.");
    }

    if (command.admin || command.botAdmin) {
      if (!isGroup) {
        return m.reply("👥 Cette commande nécessite un groupe.");
      }

      try {
        const permission = await checkCommandPermissions(
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
        console.log("🩸 Erreur permissions:", err.message);
        return m.reply("🩸 Impossible de vérifier les permissions du groupe.");
      }
    }

    try {
      await sock.sendMessage(from, {
        react: { text: "🩸", key: mRaw.key }
      });
    } catch {}

    try {
      await command.execute(sock, m, args, sessionContext);

      await persistSessionSettings(settings, sessionContext);

      try {
        await sock.sendMessage(from, {
          react: { text: "🩸", key: mRaw.key }
        });
      } catch {}
    } catch (err) {
      console.log(`🩸 Erreur .${commandName}:`, err);

      try {
        await sock.sendMessage(from, {
          react: { text: "❌", key: mRaw.key }
        });
      } catch {}

      try {
        await m.reply(
          "☠️ L'opération a échoué. Même les ténèbres rencontrent parfois une résistance."
        );
      } catch {}
    }
  } catch (err) {
    console.log("🩸 Handler Fatal Error:", err.message);
  }
}

function getGroupMemberCount(metadata) {
  return metadata?.participants?.length || 0;
}

export async function handleParticipantUpdate(
  sock,
  update,
  sessionContext = {}
) {
  try {
    const { id, participants, action } = update;
    const settings = sessionContext.settings || createSessionSettings();

    if (!id || !id.endsWith("@g.us")) return;

    const metadata = await sock.groupMetadata(id).catch(() => null);
    if (!metadata) return;

    const groupName = metadata.subject || "Groupe";
    const memberCount = getGroupMemberCount(metadata);

    if (action === "add" && settings.welcomeGroups.has(id)) {
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

    if (action === "remove" && settings.goodbyeGroups.has(id)) {
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
    console.log("🩸 Participant Update:", err.message);
  }
}

export { commands };
export default handleCommand;
