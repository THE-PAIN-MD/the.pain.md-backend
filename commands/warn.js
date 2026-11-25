
const warnings = global.groupWarnings ||= new Map();

export default {
  name: "warn",
  category: "GROUPE",
  description: "Avertir un membre",
  admin: true,

  async execute(sock, m, args) {
    if (!m.isGroup) return m.reply("❌ Groupe uniquement.");

    const target = m.mentionedJid?.[0];
    if (!target) return m.reply("Mentionne le membre à avertir.");

    const key = `${m.chat}:${target}`;
    const count = (warnings.get(key) || 0) + 1;
    warnings.set(key, count);

    const reason = args.filter(x => !x.startsWith("@")).join(" ").trim();

    await sock.sendMessage(m.chat, {
      text:
        `╭─❖ ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 ❖─╮\n\n` +
        `│ Membre : @${target.split("@")[0]}\n` +
        `│ Avertissements : ${count}/3\n` +
        `│ Motif : ${reason || "Non précisé"}\n\n` +
        `╰─────────────❖`,
      mentions: [target]
    }, { quoted: m });
  }
};
