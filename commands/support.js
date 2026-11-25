
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
  name: "support",
  category: "general",

  async execute(sock, m) {
    const text = `
╔══════════════════════╗
      🩸 𝐒𝐔𝐏𝐏𝐎𝐑𝐓 🩸
╚══════════════════════╝

╭─❖ 🌐 𝐂𝐇𝐀𝐍𝐍𝐄𝐋 🌐 ❖─╮

│ ͟͟͞ᬼ⃟─► ⏤͟͟͞𝐓𝐇𝐄 亗 𝐏𝐀𝐈𝐍 亗 𝐓𝐄𝐂𝐇᭄

│
│ ͟͟͞ᬼ⃟─► ${config.CHANNEL}

╰─────────────❖

Besoin d'aide ?

🩸 Rejoins le canal officiel
pour suivre les nouveautés.

☠️ 𝐓𝐇𝐄 𝐏𝐀𝐈𝐍 𝐌𝐃 ☠️

🩸 POWERED BY 𝐓𝐇𝐄 𝐏𝐀𝐈𝐍 🩸
`;

    await sock.sendMessage(
      m.chat,
      {
        image: { url: IMAGES.support },
        caption: text,
        contextInfo: channelContext
      },
      { quoted: m }
    );
  }
};
