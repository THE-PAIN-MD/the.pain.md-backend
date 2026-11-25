
export default {
  name: "channel",
  category: "general",
  description: "Affiche la chaîne officielle WhatsApp",

  async execute(sock, m) {
    const channelUrl =
      "https://whatsapp.com/channel/0029Vb7FTvDICVfgeK27ul2S";

    await m.reply(`
╭─❖ 🩸 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋 𝐂𝐇𝐀𝐍𝐍𝐄𝐋 🩸 ❖─╮

│ 📢 Rejoins notre chaîne officielle !
│
│ 🩸 THE PAIN MD
│
│ 🔗 ${channelUrl}
│
╰──────────────❖

> POWERED BY 🩸𝐓𝐇𝐄 𝐏𝐀𝐈𝐍🩸`);
  }
};
