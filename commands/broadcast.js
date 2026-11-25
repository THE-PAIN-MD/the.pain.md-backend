
export default {
  name: "broadcast",
  category: "owner",
  ownerOnly: true,

  async execute(sock, m, args) {
    const message = args.join(" ").trim();

    if (!message) {
      return m.reply("Utilisation : .broadcast Ton message");
    }

    const chats = await sock.groupFetchAllParticipating();
    const groupIds = Object.keys(chats);

    let sent = 0;
    let failed = 0;

    for (const jid of groupIds) {
      try {
        await sock.sendMessage(jid, {
          text: `📢 *ANNONCE — THE PAIN MD*\n\n${message}`
        });

        sent++;
      } catch {
        failed++;
      }
    }

    return m.reply(
      `📢 *BROADCAST TERMINÉ*\n\n✅ Envoyés : ${sent}\n❌ Échecs : ${failed}`
    );
  }
};
