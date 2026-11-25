
const warnings = global.groupWarnings ||= new Map();

export default {
  name: "warnlist",
  category: "ADMIN",
  description: "Afficher la liste des avertissements",
  admin: true,

  async execute(sock, m) {
    if (!m.isGroup) return m.reply("❌ Groupe uniquement.");

    const entries = [...warnings.entries()]
      .filter(([key]) => key.startsWith(`${m.chat}:`));

    if (!entries.length) {
      return m.reply("✅ Aucun avertissement dans ce groupe.");
    }

    const mentions = [];
    const lines = entries.map(([key, count], index) => {
      const jid = key.slice(m.chat.length + 1);
      mentions.push(jid);
      return `${index + 1}. @${jid.split("@")[0]} — ${count}/3`;
    });

    await sock.sendMessage(m.chat, {
      text:
        `╭─❖ ⚠️ 𝐖𝐀𝐑𝐍 𝐋𝐈𝐒𝐓 ❖─╮\n\n` +
        `${lines.join("\n")}\n\n` +
        `╰─────────────❖`,
      mentions
    }, { quoted: m });
  }
};
