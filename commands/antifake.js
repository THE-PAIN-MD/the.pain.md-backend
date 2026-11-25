
export default {
  name: "antifake",
  category: "settings",
  description: "Autorise uniquement un indicatif téléphonique défini.",
  groupOnly: true,
  admin: true,
  botAdmin: true,

  async execute(sock, m, args, sessionContext = {}) {
    const settings = sessionContext.settings || global;
    const store = settings.antifakeGroups;

    const action = String(args[0] || "status").toLowerCase();

    const existing = [...store].find(
      value => value.startsWith(`${m.chat}|`)
    );

    if (action === "off") {
      if (existing) store.delete(existing);
      return m.reply("🩸 Anti-fake désactivé.");
    }

    if (action === "on") {
      const prefix = String(args[1] || "").replace(/\D/g, "");

      if (!prefix) {
        return m.reply(
          "⚙️ Indique l'indicatif autorisé.\nExemple : .antifake on 27"
        );
      }

      if (existing) store.delete(existing);

      store.add(`${m.chat}|${prefix}`);

      return m.reply(
        `🛡️ Anti-fake activé.\nIndicatif autorisé : +${prefix}`
      );
    }

    return m.reply(
      existing
        ? `🛡️ ANTI-FAKE ACTIVÉ — indicatif +${existing.split("|")[1]}`
        : "⚙️ ANTI-FAKE DÉSACTIVÉ\nUtilisation : .antifake on 27 ou .antifake off"
    );
  }
};
