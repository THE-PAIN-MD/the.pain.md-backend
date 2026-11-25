
const styles = [
  text => `꧁༒ ${text} ༒꧂`,
  text => `『 ${text} 』`,
  text => `亗 ${text} 亗`,
  text => `⏤͟͟͞ ${text} ✦`,
  text => `༺ ${text} ༻`,
  text => `『🩸』${text}『🩸』`,
  text => `乂 ${text} 乂`,
  text => `⟡ ${text} ⟡`
];

export default {
  name: "title",
  category: "DARK",
  description: "Créer un titre stylé",

  async execute(sock, m, args) {
    const text = args.join(" ").trim();

    if (!text) {
      return m.reply("❌ Exemple : .title THE PAIN");
    }

    const style = styles[Math.floor(Math.random() * styles.length)];

    await m.reply(
      `╭─❖ 🩸 𝐒𝐓𝐘𝐋𝐄 𝐓𝐈𝐓𝐋𝐄 ❖─╮\n\n${style(text)}\n\n╰─────────────❖`
    );
  }
};
