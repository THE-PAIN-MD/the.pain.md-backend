
export default {
  name: "getpp",
  category: "general",
  description: "Récupère ta photo de profil WhatsApp",

  async execute(sock, m) {
    const jid = m.sender;

    if (!jid) {
      return m.reply("❌ Impossible de récupérer ton identifiant.");
    }

    try {
      const ppUrl = await sock.profilePictureUrl(jid, "image");

      await sock.sendMessage(m.chat, {
        image: { url: ppUrl },
        caption: `
╭─❖ 🩸 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 𝐏𝐈𝐂𝐓𝐔𝐑𝐄 🩸 ❖─╮

│ 👤 Utilisateur : ${m.pushName || "Utilisateur"}
│ 🩸 THE PAIN MD
│
╰──────────────❖

> POWERED BY 🩸𝐓𝐇𝐄 𝐏𝐀𝐈𝐍🩸`
      });
    } catch {
      await m.reply("❌ Aucune photo de profil accessible pour ce compte.");
    }
  }
};
