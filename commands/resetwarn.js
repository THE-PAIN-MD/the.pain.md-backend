
const warnings = global.groupWarnings ||= new Map();

export default {
  name: "resetwarn",
  category: "GROUPE",
  description: "Réinitialiser les avertissements",
  admin: true,

  async execute(sock, m) {
    if (!m.isGroup) return m.reply("❌ Groupe uniquement.");

    for (const key of warnings.keys()) {
      if (key.startsWith(`${m.chat}:`)) warnings.delete(key);
    }

    return m.reply("✅ Tous les avertissements de ce groupe ont été réinitialisés.");
  }
};
