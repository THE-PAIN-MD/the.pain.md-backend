
export default {
  name: "shutdown",
  category: "owner",
  ownerOnly: true,

  async execute(sock, m) {
    await m.reply("🛑 Arrêt de THE PAIN MD...");

    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }
};
