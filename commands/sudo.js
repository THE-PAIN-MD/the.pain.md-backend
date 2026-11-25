
export default {
  name: "sudo",
  category: "owner",
  ownerOnly: true,

  async execute(sock, m, args, sessionContext) {
    const number = (args[0] || "").replace(/\D/g, "");

    if (!number) {
      return m.reply("Utilisation : .sudo 243XXXXXXXXX");
    }

    const settings = sessionContext.settings;

    if (!settings?.sudoUsers) {
      return m.reply("❌ Système SUDO indisponible.");
    }

    if (settings.sudoUsers.has(number)) {
      return m.reply("⚠️ Ce numéro est déjà SUDO.");
    }

    settings.sudoUsers.add(number);

    return m.reply(`✅ ${number} ajouté à la liste SUDO.`);
  }
};
