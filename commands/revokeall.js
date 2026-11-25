
export default {
  name: "revokeall",
  category: "GROUPE",
  description: "Refuser les demandes d'adhésion",
  admin: true,
  botAdmin: true,

  async execute(sock, m) {
    if (!m.isGroup) return m.reply("❌ Groupe uniquement.");

    try {
      const requests = await sock.groupRequestParticipantsList(m.chat);

      if (!requests.length) {
        return m.reply("Aucune demande en attente.");
      }

      const participants = requests.map(p => p.jid);

      const result = await sock.groupRequestParticipantsUpdate(
        m.chat,
        participants,
        "reject"
      );

      await m.reply(
        `✅ Traitement terminé.\nDemandes refusées : ${result.length}`
      );
    } catch (error) {
      console.error(error);
      m.reply("❌ Impossible de refuser les demandes.");
    }
  }
};
