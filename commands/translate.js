
export default {
  name: "translate",
  category: "UTILITY",
  description: "Traduire un texte",

  async execute(sock, m, args) {
    const input = args.join(" ");
    const parts = input.split("|");

    if (parts.length < 3) {
      return m.reply(
        "❌ Utilisation : .translate en|fr|Hello, how are you?"
      );
    }

    const [from, to, ...textParts] = parts;
    const content = textParts.join("|").trim();

    if (!content) return m.reply("❌ Texte manquant.");

    try {
      const params = new URLSearchParams({
        q: content,
        langpair: `${from.trim()}|${to.trim()}`
      });

      const response = await fetch(
        `https://api.mymemory.translated.net/get?${params}`
      );

      const data = await response.json();

      if (data.responseStatus !== 200) {
        return m.reply("❌ Traduction indisponible.");
      }

      await m.reply(
        `╭─❖ 🌍 𝐓𝐑𝐀𝐍𝐒𝐋𝐀𝐓𝐄 ❖─╮\n\n` +
        `│ De : ${from}\n` +
        `│ Vers : ${to}\n\n` +
        `${data.responseData.translatedText}\n\n` +
        `╰─────────────❖`
      );
    } catch (error) {
      console.error(error);
      m.reply("❌ Erreur de traduction.");
    }
  }
};
