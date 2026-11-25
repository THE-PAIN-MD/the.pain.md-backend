
export default {
  name: "grouplink",
  category: "GROUPE",
  description: "Obtenir le lien d'invitation du groupe",
  admin: true,
  botAdmin: true,

  async execute(sock, m) {
    if (!m.isGroup) return m.reply("❌ Groupe uniquement.");

    try {
      const code = await sock.groupInviteCode(m.chat);
      await m.reply(
        `╭─❖ 🔗 𝐆𝐑𝐎𝐔𝐏 𝐋𝐈𝐍𝐊 ❖─╮\n\nhttps://chat.whatsapp.com/${code}\n\n╰─────────────❖`
      );
    } catch (error) {
      console.error(error);
      m.reply("❌ Impossible de récupérer le lien.");
    }
  }
};
