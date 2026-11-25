
export default {
  name: "groupinfo",
  category: "GROUPE",
  description: "Afficher les informations du groupe",

  async execute(sock, m) {
    if (!m.isGroup) return m.reply("❌ Groupe uniquement.");

    try {
      const g = await sock.groupMetadata(m.chat);
      const admins = g.participants.filter(p =>
        p.admin === "admin" || p.admin === "superadmin"
      ).length;

      const text =
        `╭─❖ 🩸 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎 🩸 ❖─╮\n\n` +
        `│ ➤ Nom : ${g.subject}\n` +
        `│ ➤ ID : ${g.id}\n` +
        `│ ➤ Membres : ${g.participants.length}\n` +
        `│ ➤ Administrateurs : ${admins}\n` +
        `│ ➤ Description : ${g.desc || "Aucune"}\n\n` +
        `╰─────────────❖`;

      await m.reply(text);
    } catch (error) {
      console.error(error);
      m.reply("❌ Impossible de récupérer les informations.");
    }
  }
};
