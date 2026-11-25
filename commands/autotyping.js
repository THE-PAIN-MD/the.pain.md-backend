
export default {
  name: "autotyping",
  category: "settings",
  description: "Affiche le statut de saisie du bot.",
  async execute(sock, m, args, sessionContext = {}) {
    const settings = sessionContext.settings || global;
    const store = settings.autotypingChats;
    const action = String(args[0] || "status").toLowerCase();

    if (action === "on") {
      store.add(m.chat);
      return m.reply("🩸 Auto-typing activé.");
    }

    if (action === "off") {
      store.delete(m.chat);
      return m.reply("🩸 Auto-typing désactivé.");
    }

    return m.reply(
      `⚙️ AUTO-TYPING : ${store.has(m.chat) ? "ACTIVÉ" : "DÉSACTIVÉ"}\nUtilisation : .autotyping on/off`
    );
  }
};
