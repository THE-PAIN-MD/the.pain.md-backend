
const ranks = [
  "🩸 𝐍𝐄𝐖𝐁𝐈𝐄",
  "⚔️ 𝐖𝐀𝐑𝐑𝐈𝐎𝐑",
  "🔥 𝐄𝐋𝐈𝐓𝐄",
  "👑 𝐄𝐗𝐏𝐄𝐑𝐓",
  "亗 𝐌𝐀𝐒𝐓𝐄𝐑",
  "💎 𝐋𝐄𝐆𝐄𝐍𝐃",
  "♛ 𝐌𝐘𝐓𝐇𝐈𝐂"
];

export default {
  name: "rank",
  category: "DARK",
  description: "Attribuer un rang aléatoire",

  async execute(sock, m) {
    const target = m.mentionedJid?.[0] || m.sender;
    const rank = ranks[Math.floor(Math.random() * ranks.length)];

    await sock.sendMessage(m.chat, {
      text:
        `╭─❖ 👑 𝐑𝐀𝐍𝐊 𝐒𝐘𝐒𝐓𝐄𝐌 ❖─╮\n\n` +
        `│ Membre : @${target.split("@")[0]}\n` +
        `│ Rang : ${rank}\n\n` +
        `╰─────────────❖`,
      mentions: [target]
    }, { quoted: m });
  }
};
