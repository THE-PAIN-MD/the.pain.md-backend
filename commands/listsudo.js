
export default {
  name: "listsudo",
  category: "owner",
  ownerOnly: true,

  async execute(sock, m, args, sessionContext) {
    const list = [...(sessionContext.settings?.sudoUsers || [])];

    return m.reply(
      `👑 *LISTE SUDO — THE PAIN MD*\n\n` +
      (list.length
        ? list.map((number, index) => `${index + 1}. ${number}`).join("\n")
        : "Aucun utilisateur SUDO enregistré.")
    );
  }
};
