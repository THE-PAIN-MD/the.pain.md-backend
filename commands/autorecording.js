
export default {
  name: "autorecording",
  category: "settings",
  description: "Affiche le statut d'enregistrement du bot.",
  async execute(sock, m, args, sessionContext = {}) {
    const settings = sessionContext.settings || global;
    const store = settings.autorecordingChats;
    const action = String(args[0] || "status").toLowerCase();

    if (action === "on") {
      store.add(m.chat);
      return m.reply("🩸 Auto-recording activé.");
    }

    if (action === "off") {
      store.delete(m.chat);
      return m.reply("🩸 Auto-recording désactivé.");
    }

    return m.reply(
      `⚙️ AUTO-RECORDING : ${store.has(m.chat) ? "ACTIVÉ" : "DÉSACTIVÉ"}\nUtilisation : .autorecording on/off`
    );
  }
};
