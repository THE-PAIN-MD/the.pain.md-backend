
export default {
  name: "left",
  category: "group",
  description: "Faire quitter le groupe au bot",

  async execute(sock, m, args) {
    if (!m.isGroup) {
      return m.reply("❌ Cette commande fonctionne uniquement dans un groupe.");
    }

    try {
      await sock.groupLeave(m.chat);
    } catch (error) {
      console.error("[LEFT ERROR]", error);
    }
  }
};
