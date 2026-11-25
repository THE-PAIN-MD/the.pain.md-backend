
export default {
  name: "lockdesc",
  category: "ADMIN",
  description: "Verrouiller les modifications des informations du groupe",
  admin: true,
  botAdmin: true,

  async execute(sock, m, args) {
    if (!m.isGroup) return m.reply("❌ Groupe uniquement.");

    const action = args[0]?.toLowerCase();

    if (!["on", "off"].includes(action)) {
      return m.reply("Utilisation : .lockdesc on / .lockdesc off");
    }

    try {
      await sock.groupSettingUpdate(
        m.chat,
        action === "on" ? "locked" : "unlocked"
      );

      return m.reply(
        action === "on"
          ? "🔒 Les informations du groupe sont maintenant verrouillées pour les membres."
          : "🔓 Les modifications des informations du groupe sont autorisées."
      );
    } catch (error) {
      console.error("LOCKDESC ERROR:", error);
      return m.reply("❌ Impossible de modifier les paramètres du groupe.");
    }
  }
};
