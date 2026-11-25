
export default {
  name: "poll",
  category: "GROUPE",
  description: "Créer un sondage WhatsApp",

  async execute(sock, m, args) {
    if (!m.isGroup) return m.reply("❌ Groupe uniquement.");

    const input = args.join(" ").split("|").map(x => x.trim());
    const question = input.shift();
    const options = input.filter(Boolean);

    if (!question || options.length < 2) {
      return m.reply(
        "❌ Utilisation :\n.poll Votre question | Option 1 | Option 2"
      );
    }

    if (options.length > 12) {
      return m.reply("❌ Maximum 12 options.");
    }

    try {
      await sock.sendMessage(m.chat, {
        poll: {
          name: question,
          values: options,
          selectableCount: 1
        }
      }, { quoted: m });
    } catch (error) {
      console.error(error);
      m.reply("❌ Impossible de créer le sondage.");
    }
  }
};
