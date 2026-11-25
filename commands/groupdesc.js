
export default {
  name: "groupdesc",
  category: "GROUPE",
  description: "Modifier la description du groupe",
  admin: true,
  botAdmin: true,

  async execute(sock, m, args) {
    if (!m.isGroup) return m.reply("❌ Groupe uniquement.");

    const description = args.join(" ").trim();
    if (!description) {
      return m.reply("Utilisation : .groupdesc Nouvelle description");
    }

    try {
      await sock.groupUpdateDescription(m.chat, description);
      await m.reply("✅ Description du groupe mise à jour.");
    } catch (error) {
      console.error(error);
      m.reply("❌ Impossible de modifier la description.");
    }
  }
};
