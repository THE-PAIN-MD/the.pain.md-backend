
export default {
  name: "public",
  category: "owner",
  ownerOnly: true,

  async execute(sock, m, args, sessionContext) {
    sessionContext.mode = "public";
    sessionContext.botMode = "public";

    return m.reply("🌍 THE PAIN MD est maintenant en mode PUBLIC.");
  }
};
