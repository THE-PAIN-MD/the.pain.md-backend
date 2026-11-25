
export default {
  name: "lockpp",
  category: "ADMIN",
  description: "Verrouiller les modifications des informations du groupe",
  admin: true,
  botAdmin: true,

  async execute(sock, m, args) {
    if (!m.isGroup) return m.reply("❌ Groupe uniquement.");

    const action = args[0]?.toLowerCase();

    if (!["on", "off"].includes(action)) {
      return m.reply("Utilisation : .lockpp on / .lockpp off");
    }

    try {
      await sock.groupSettingUpdate(
        m.chat,
        action === "on" ? "locked" : "unlocked"
      );

      return m.reply(
        action === "on"
          ? "🔒 Les modifications des informations du groupe sont verrouillées."
          : "🔓 Les modifications des informations du groupe sont autorisées."
      );
    } catch (error) {
      console.error("LOCKPP ERROR:", error);
      return m.reply("❌ Impossible de modifier les paramètres du groupe.");
    }
  }
};
