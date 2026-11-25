
export default {
  name: "antibot",
  category: "settings",
  description: "Filtre les participants explicitement identifiés comme bots.",
  groupOnly: true,
  admin: true,
  botAdmin: true,

  async execute(sock, m, args, sessionContext = {}) {
    const settings = sessionContext.settings || global;
    const store = settings.antibotGroups;

    const action = String(args[0] || "status").toLowerCase();

    if (action === "on") {
      store.add(m.chat);
      return m.reply("🩸 Anti-bot activé.");
    }

    if (action === "off") {
      store.delete(m.chat);
      return m.reply("🩸 Anti-bot désactivé.");
    }

    return m.reply(
      `⚙️ ANTI-BOT : ${store.has(m.chat) ? "ACTIVÉ" : "DÉSACTIVÉ"}\nUtilisation : .antibot on/off`
    );
  }
};
