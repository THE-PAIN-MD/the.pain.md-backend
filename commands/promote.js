
export default {
  name: "promote",
  category: "admin",
  description: "Promouvoir un membre.",
  admin: true,
  botAdmin: true,

  async execute(sock, m) {
    const target = m.mentionedJid?.[0] || m.quoted?.sender;

    if (!target) return m.reply("Mentionne ou réponds au membre à promouvoir.");

    const metadata = await sock.groupMetadata(m.chat);
    const member = metadata.participants.find(p => p.id === target);

    if (!member) return m.reply("Ce membre n'est pas dans le groupe.");
    if (member.admin) return m.reply("Ce membre est déjà administrateur.");

    await sock.groupParticipantsUpdate(m.chat, [target], "promote");

    return m.reply(
      `╭─❖ 🩸 𝐏𝐑𝐎𝐌𝐎𝐓𝐄 🩸 ❖─╮\n\n│ ͟͟͞ᬼ⃟─► 👤 𝐔𝐬𝐞𝐫 : @${target.split("@")[0]}\n│ ͟͟͞ᬼ⃟─► 👑 𝐑𝐚𝐧𝐠 : Administrateur\n\n╰─────────────❖`,
      { mentions: [target] }
    );
  }
};
