
const warnings = global.groupWarnings ||= new Map();

export default {
  name: "unwarn",
  category: "GROUPE",
  description: "Retirer un avertissement",
  admin: true,

  async execute(sock, m) {
    if (!m.isGroup) return m.reply("❌ Groupe uniquement.");

    const target = m.mentionedJid?.[0];
    if (!target) return m.reply("Mentionne le membre.");

    const key = `${m.chat}:${target}`;
    const count = warnings.get(key) || 0;

    if (count === 0) return m.reply("Ce membre n'a aucun avertissement.");

    if (count === 1) warnings.delete(key);
    else warnings.set(key, count - 1);

    return m.reply(`✅ Un avertissement retiré. Il en reste : ${count - 1}.`);
  }
};
