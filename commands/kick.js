
export default {
  name: "kick",
  category: "admin",
  description: "Expulse un membre.",
  admin: true,
  botAdmin: true,

  async execute(sock, m) {
    const target =
      m.mentionedJid?.[0] ||
      m.quoted?.sender;

    if (!target) {
      return m.reply("╭─❖ 🩸 𝐊𝐈𝐂𝐊 🩸 ❖─╮\n│ ͟͟͞ᬼ⃟─► Mentionne ou réponds au membre à expulser.\n╰─────────────❖");
    }

    if (target === sock.user.id) {
      return m.reply("Je ne peux pas m'expulser moi-même.");
    }

    const metadata = await sock.groupMetadata(m.chat);
    const participant = metadata.participants.find(p => p.id === target);

    if (!participant) return m.reply("Ce membre n'est pas dans le groupe.");

    if (participant.admin) {
      return m.reply("Les administrateurs sont protégés.");
    }

    await sock.groupParticipantsUpdate(m.chat, [target], "remove");

    return m.reply(
      `╭─❖ 🩸 𝐊𝐈𝐂𝐊 🩸 ❖─╮\n\n│ ͟͟͞ᬼ⃟─► 👤 𝐌𝐞𝐦𝐛𝐫𝐞 : @${target.split("@")[0]}\n│ ͟͟͞ᬼ⃟─► ✅ 𝐒𝐭𝐚𝐭𝐮𝐭 : Expulsé\n\n╰─────────────❖`,
      { mentions: [target] }
    );
  }
};
