
export default {
  name: "lockname",
  category: "ADMIN",
  description: "Verrouiller ou autoriser les modifications des infos du groupe",
  admin: true,
  botAdmin: true,

  async execute(sock, m, args) {
    if (!m.isGroup) return m.reply("❌ Groupe uniquement.");

    const action = args[0]?.toLowerCase();

    if (!["on", "off"].includes(action)) {
      return m.reply("Utilisation : .lockname on / .lockname off");
    }

    try {
      await sock.groupSettingUpdate(
        m.chat,
        action === "on" ? "locked" : "unlocked"
      );

      return m.reply(
        action === "on"
          ? "🔒 Les modifications des informations du groupe sont réservées aux administrateurs."
          : "🔓 Les membres peuvent à nouveau modifier les informations du groupe, selon les paramètres WhatsApp."
      );
    } catch (error) {
      console.error("LOCKNAME ERROR:", error);
      return m.reply("❌ Impossible de modifier les paramètres du groupe.");
    }
  }
};
