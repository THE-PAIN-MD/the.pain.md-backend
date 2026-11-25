
export default {
  name: "delsudo",
  category: "owner",
  ownerOnly: true,

  async execute(sock, m, args, sessionContext) {
    const number = (args[0] || "").replace(/\D/g, "");

    if (!number) {
      return m.reply("Utilisation : .delsudo 243XXXXXXXXX");
    }

    const settings = sessionContext.settings;

    if (!settings?.sudoUsers) {
      return m.reply("❌ Système SUDO indisponible.");
    }

    settings.sudoUsers.delete(number);

    return m.reply(`✅ ${number} retiré de la liste SUDO.`);
  }
};
