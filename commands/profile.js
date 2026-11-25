
export default {
  name: "profile",
  category: "general",
  description: "Affiche ton profil WhatsApp",

  async execute(sock, m) {
    const sender = m.sender;

    if (!sender) {
      return m.reply("❌ Impossible de récupérer ton identifiant WhatsApp.");
    }

    const name = m.pushName || "Utilisateur";
    const groupStatus = m.isGroup ? "Groupe" : "Conversation privée";

    const text = `
╭─❖ 🩸 𝐔𝐒𝐄𝐑 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 🩸 ❖─╮

│ 👤 Nom : ${name}
│ 🆔 Identifiant : ${sender}
│ 💬 Conversation : ${groupStatus}
│
│ 👑 Bot : THE PAIN MD
│ ⚙️ Version : 3.0.0
│
╰──────────────❖

> POWERED BY 🩸𝐓𝐇𝐄 𝐏𝐀𝐈𝐍🩸`;

    await m.reply(text);
  }
};
