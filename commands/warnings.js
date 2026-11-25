
const warnings = global.groupWarnings ||= new Map();

export default {
  name: "warnings",
  category: "GROUPE",
  description: "Consulter les avertissements",
  admin: true,

  async execute(sock, m) {
    if (!m.isGroup) return m.reply("❌ Groupe uniquement.");

    const entries = [...warnings.entries()]
      .filter(([key]) => key.startsWith(`${m.chat}:`));

    if (!entries.length) return m.reply("✅ Aucun avertissement enregistré.");

    const text = entries.map(([key, count]) => {
      const jid = key.slice(m.chat.length + 1);
      return `│ @${jid.split("@")[0]} : ${count}/3`;
    }).join("\n");

    const mentions = entries.map(([key]) =>
      key.slice(m.chat.length + 1)
    );

    await sock.sendMessage(m.chat, {
      text: `╭─❖ ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 𝐋𝐈𝐒𝐓 ❖─╮\n\n${text}\n\n╰─────────────❖`,
      mentions
    }, { quoted: m });
  }
};
