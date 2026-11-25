
export default {
  name: "members",
  category: "GROUPE",
  description: "Afficher les membres du groupe",

  async execute(sock, m) {
    if (!m.isGroup) return m.reply("❌ Groupe uniquement.");

    try {
      const g = await sock.groupMetadata(m.chat);

      const list = g.participants.map((p, i) =>
        `${i + 1}. @${p.id.split("@")[0]}`
      ).join("\n");

      const mentions = g.participants.map(p => p.id);

      await sock.sendMessage(m.chat, {
        text: `╭─❖ 👥 𝐆𝐑𝐎𝐔𝐏 𝐌𝐄𝐌𝐁𝐄𝐑𝐒 ❖─╮\n\n${list}\n\nTotal : ${g.participants.length}\n╰─────────────❖`,
        mentions
      }, { quoted: m });
    } catch (error) {
      console.error(error);
      m.reply("❌ Impossible de récupérer les membres.");
    }
  }
};
