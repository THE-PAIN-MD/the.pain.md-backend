
export default {
  name: "tagall",
  category: "group",
  description: "Mentionne les membres du groupe.",
  admin: true,

  async execute(sock, m, args) {
    const metadata = await sock.groupMetadata(m.chat);
    const members = metadata.participants || [];

    const message = args.join(" ") || "Tous les membres sont convoqués.";

    const mentions = members.map(member => member.id);

    let text = `
╭─❖ 🩸 𝐓𝐀𝐆𝐀𝐋𝐋 🩸 ❖─╮

│ ͟͟͞ᬼ⃟─► 🏠 𝐆𝐫𝐨𝐮𝐩𝐞 : ${metadata.subject}
│ ͟͟͞ᬼ⃟─► 👥 𝐌𝐞𝐦𝐛𝐫𝐞𝐬 : ${members.length}
│ ͟͟͞ᬼ⃟─► 📢 𝐌𝐞𝐬𝐬𝐚𝐠𝐞 : ${message}

╰─────────────❖

`;

    for (const member of members) {
      text += `│ ͟͟͞ᬼ⃟─► @${member.id.split("@")[0]}\n`;
    }

    await sock.sendMessage(m.chat, {
      text,
      mentions
    }, { quoted: m });
  }
};
