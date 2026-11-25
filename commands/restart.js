
export default {
  name: "restart",
  category: "owner",
  ownerOnly: true,

  async execute(sock, m) {
    await m.reply("🔄 Redémarrage de THE PAIN MD...");

    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }
};
