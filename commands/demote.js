
export default {
  name: "demote",
  category: "admin",
  description: "Rétrograder un administrateur.",
  admin: true,
  botAdmin: true,

  async execute(sock, m) {
    const target = m.mentionedJid?.[0] || m.quoted?.sender;

    if (!target) return m.reply("Mentionne ou réponds à l'administrateur.");

    const metadata = await sock.groupMetadata(m.chat);
    const member = metadata.participants.find(p => p.id === target);

    if (!member) return m.reply("Ce membre n'est pas dans le groupe.");
    if (!member.admin) return m.reply("Ce membre n'est pas administrateur.");

    const botId = sock.user.id.split(":")[0].split("@")[0];
    if (target.split("@")[0].split(":")[0] === botId) {
      return m.reply("Je ne peux pas me rétrograder moi-même.");
    }

    await sock.groupParticipantsUpdate(m.chat, [target], "demote");

    return m.reply(
      `╭─❖ 🩸 𝐃𝐄𝐌𝐎𝐓𝐄 🩸 ❖─╮\n\n│ ͟͟͞ᬼ⃟─► 👤 𝐔𝐬𝐞𝐫 : @${target.split("@")[0]}\n│ ͟͟͞ᬼ⃟─► ⚙️ 𝐑𝐚𝐧𝐠 : Membre\n\n╰─────────────❖`,
      { mentions: [target] }
    );
  }
};
