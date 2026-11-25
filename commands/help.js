
export default {
  name: "help",
  category: "general",
  description: "Affiche l'aide du bot",

  async execute(sock, m) {
    const text = `
╭─❖ 🩸 𝐓𝐇𝐄 𝐏𝐀𝐈𝐍 𝐇𝐄𝐋𝐏 🩸 ❖─╮

│
│ 👋 Bienvenue sur THE PAIN MD !
│
│ 📌 COMMANDES PRINCIPALES
│
│ ◈ .menu
│    Afficher le menu complet
│
│ ◈ .alive
│    Vérifier le fonctionnement du bot
│
│ ◈ .ping
│    Vérifier la vitesse du bot
│
│ ◈ .botinfo
│    Informations sur le bot
│
│ ◈ .profile
│    Voir ton profil WhatsApp
│
│ ◈ .getpp
│    Obtenir une photo de profil
│
│ ◈ .channel
│    Accéder à notre chaîne WhatsApp
│
│ ◈ .feedback <message>
│    Envoyer un avis au développeur
│
│
│ 👑 𝐃𝐞𝐯 : THE PAIN
│ ⚙️ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧 : 3.0.0
│
╰──────────────❖

> POWERED BY 🩸𝐓𝐇𝐄 𝐏𝐀𝐈𝐍🩸`;

    await m.reply(text);
  }
};
