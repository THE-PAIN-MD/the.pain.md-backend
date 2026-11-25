
export default {
  name: "admins",
  category: "GROUPE",
  description: "Afficher les administrateurs du groupe",

  async execute(sock, m) {
    if (!m.isGroup) return m.reply("❌ Groupe uniquement.");

    try {
      const g = await sock.groupMetadata(m.chat);
      const admins = g.participants.filter(p =>
        p.admin === "admin" || p.admin === "superadmin"
      );

      if (!admins.length) return m.reply("Aucun administrateur trouvé.");

      const mentions = admins.map(p => p.id);
      const list = admins.map((p, i) =>
        `${i + 1}. @${p.id.split("@")[0]}`
      ).join("\n");

      await sock.sendMessage(m.chat, {
        text: `╭─❖ 👑 𝐆𝐑𝐎𝐔𝐏 𝐀𝐃𝐌𝐈𝐍𝐒 ❖─╮\n\n${list}\n\n╰─────────────❖`,
        mentions
      }, { quoted: m });
    } catch (error) {
      console.error(error);
      m.reply("❌ Erreur.");
    }
  }
};
