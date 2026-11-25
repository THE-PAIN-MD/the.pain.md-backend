
export default {
  name: "tagadmins",
  category: "GROUPE",
  description: "Mentionner les administrateurs",

  async execute(sock, m, args) {
    if (!m.isGroup) return m.reply("❌ Groupe uniquement.");

    try {
      const metadata = await sock.groupMetadata(m.chat);
      const admins = metadata.participants.filter(p =>
        p.admin === "admin" || p.admin === "superadmin"
      );

      if (!admins.length) return m.reply("Aucun administrateur trouvé.");

      const mentions = admins.map(p => p.id);
      const text = args.join(" ").trim() || "Attention aux administrateurs !";

      await sock.sendMessage(m.chat, {
        text: `╭─❖ 👑 𝐓𝐀𝐆 𝐀𝐃𝐌𝐈𝐍𝐒 ❖─╮\n\n${text}\n\n` +
          admins.map(p => `│ ➤ @${p.id.split("@")[0]}`).join("\n") +
          "\n\n╰─────────────❖",
        mentions
      }, { quoted: m });
    } catch (error) {
      console.error(error);
      m.reply("❌ Erreur pendant la mention.");
    }
  }
};
