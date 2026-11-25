
export default {
  name: "autoreact",
  category: "settings",
  description: "Réagit aléatoirement aux messages.",
  async execute(sock, m, args, sessionContext = {}) {
    const settings = sessionContext.settings || global;
    const store = settings.autoreactChats;
    const action = String(args[0] || "status").toLowerCase();

    if (action === "on") {
      store.add(m.chat);
      return m.reply("🩸 Auto-react activé.");
    }

    if (action === "off") {
      store.delete(m.chat);
      return m.reply("🩸 Auto-react désactivé.");
    }

    return m.reply(
      `⚙️ AUTO-REACT : ${store.has(m.chat) ? "ACTIVÉ" : "DÉSACTIVÉ"}\nUtilisation : .autoreact on/off`
    );
  }
};
