
export default {
  name: "approve",
  category: "ADMIN",
  description: "Accepter une demande d'adhésion",
  admin: true,
  botAdmin: true,

  async execute(sock, m) {
    if (!m.isGroup) return m.reply("❌ Groupe uniquement.");

    const target = m.mentionedJid?.[0];

    if (!target) {
      return m.reply("❌ Mentionne le membre dont tu veux accepter la demande.");
    }

    try {
      const result = await sock.groupRequestParticipantsUpdate(
        m.chat,
        [target],
        "approve"
      );

      const status = result?.[0]?.status;

      if (status === "200") {
        return m.reply(`✅ Demande acceptée pour @${target.split("@")[0]}.`);
      }

      return m.reply(
        `ℹ️ WhatsApp a répondu avec le statut : ${status || "inconnu"}. Vérifie la liste des demandes.`
      );
    } catch (error) {
      console.error("APPROVE ERROR:", error);
      return m.reply("❌ Impossible d'accepter cette demande. Vérifie qu'elle est toujours en attente.");
    }
  }
};
