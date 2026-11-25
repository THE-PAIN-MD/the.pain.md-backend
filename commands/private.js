
export default {
  name: "private",
  category: "owner",
  ownerOnly: true,

  async execute(sock, m, args, sessionContext) {
    sessionContext.mode = "private";
    sessionContext.botMode = "private";

    return m.reply("🔐 THE PAIN MD est maintenant en mode PRIVATE.");
  }
};
