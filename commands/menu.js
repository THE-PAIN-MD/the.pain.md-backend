
import config from "../config.js";
import { IMAGES } from "../system/botAssets.js";

const channelContext = {
  isForwarded: true,
  forwardingScore: 999,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363422649925479@newsletter",
    newsletterName: "⏤͟͟͞𝐓𝐇𝐄 亗 𝐏𝐀𝐈𝐍 亗 𝐓𝐄𝐂𝐇᭄",
    serverMessageId: 1
  }
};

export default {
  name: "botinfo",
  category: "general",

  async execute(sock, m) {
    const commands = global.commands;

    const commandCount = commands
      ? commands instanceof Map
        ? commands.size
        : Object.keys(commands).length
      : 0;

    const text = `
╔══════════════════════╗
     ☠️ 𝐁𝐎𝐓 𝐈𝐍𝐅𝐎 ☠️
╚══════════════════════╝

╭─❖ 🩸 𝐈𝐍𝐅𝐎𝐒 🩸 ❖─╮

│ ͟͟͞ᬼ⃟─► 🤖 𝐁𝐨𝐭 : ${config.BOT_NAME}
│ ͟͟͞ᬼ⃟─► 👤 𝐔𝐬𝐞𝐫 : ${m.pushName || "Unknown"}
│ ͟͟͞ᬼ⃟─► 👑 𝐃𝐞𝐯 : ${config.OWNER_NAME}
│ ͟͟͞ᬼ⃟─► ⚙️ 𝐌𝐨𝐝𝐞 : ${config.MODE}
│ ͟͟͞ᬼ⃟─► 📦 𝐕𝐞𝐫𝐬𝐢𝐨𝐧 : ${config.VERSION}
│ ͟͟͞ᬼ⃟─► ⏳ 𝐔𝐩𝐭𝐢𝐦𝐞 : ${Math.floor(process.uptime())}s
│ ͟͟͞ᬼ⃟─► 🧩 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐞𝐬 : ${commandCount}

╰─────────────❖

🩸 𝐏𝐀𝐈𝐍 𝐒𝐘𝐒𝐓𝐄𝐌 𝐀𝐂𝐓𝐈𝐕𝐄 🩸

🩸 POWERED BY 𝐓𝐇𝐄 𝐏𝐀𝐈𝐍 🩸
`;

    await sock.sendMessage(
      m.chat,
      {
        image: { url: IMAGES.botinfo },
        caption: text,
        contextInfo: channelContext
      },
      { quoted: m }
    );
  }
};
