
export default {
  name: "antilink",
  category: "settings",
  description: "Supprime les liens envoyés par les membres non-admins.",
  groupOnly: true,
  admin: true,
  botAdmin: true,

  async execute(sock, m, args, sessionContext = {}) {
    const settings = sessionContext.settings || global;
    const store = settings.antilinkGroups;

    const action = String(args[0] || "status").toLowerCase();

    if (action === "on") {
      store.add(m.chat);
      return m.reply("🩸 Anti-link activé. Les liens des membres non-admins seront supprimés.");
    }

    if (action === "off") {
      store.delete(m.chat);
      return m.reply("🩸 Anti-link désactivé.");
    }

    return m.reply(
      `⚙️ ANTI-LINK : ${store.has(m.chat) ? "ACTIVÉ" : "DÉSACTIVÉ"}\nUtilisation : .antilink on/off`
    );
  }
};
