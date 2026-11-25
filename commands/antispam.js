
export default {
  name: "antispam",
  category: "settings",
  description: "Limite les messages envoyés trop rapidement.",
  groupOnly: true,
  admin: true,
  botAdmin: true,

  async execute(sock, m, args, sessionContext = {}) {
    const settings = sessionContext.settings || global;
    const store = settings.antispamGroups;

    const action = String(args[0] || "status").toLowerCase();

    if (action === "on") {
      store.add(m.chat);
      return m.reply("🩸 Anti-spam activé.");
    }

    if (action === "off") {
      store.delete(m.chat);
      return m.reply("🩸 Anti-spam désactivé.");
    }

    return m.reply(
      `⚙️ ANTI-SPAM : ${store.has(m.chat) ? "ACTIVÉ" : "DÉSACTIVÉ"}\nUtilisation : .antispam on/off`
    );
  }
};
