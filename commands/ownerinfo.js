
import config from "../config.js";

export default {
  name: "ownerinfo",
  category: "owner",
  ownerOnly: true,

  async execute(sock, m, args, sessionContext) {
    const sudoCount = sessionContext.settings?.sudoUsers?.size || 0;

    return m.reply(
      `╭━━〔 👑 OWNER PANEL 〕━━╮\n` +
      `│\n` +
      `│ 🤖 BOT : ${config.BOT_NAME}\n` +
      `│ 👤 OWNER : ${config.OWNER_NAME}\n` +
      `│ ⚙️ VERSION : ${config.VERSION}\n` +
      `│ 🔐 MODE : ${sessionContext.mode || sessionContext.botMode || config.MODE}\n` +
      `│ 👥 SUDO : ${sudoCount}\n` +
      `│\n` +
      `╰━━━━━━━━━━━━━━━━━━━━╯\n\n` +
      `🩸 𝐓𝐇𝐄 𝐏𝐀𝐈𝐍 𝐌𝐃`
    );
  }
};
