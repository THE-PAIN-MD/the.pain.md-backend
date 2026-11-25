
export default {
  name: "define",
  category: "UTILITY",
  description: "Définir un mot",

  async execute(sock, m, args) {
    const word = args.join(" ").trim();

    if (!word) {
      return m.reply("❌ Exemple : .define computer");
    }

    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
      );

      if (!response.ok) {
        return m.reply("❌ Définition introuvable.");
      }

      const data = await response.json();
      const entry = data[0];
      const meanings = entry.meanings.slice(0, 3).map(item => {
        const definition = item.definitions[0]?.definition;
        return `• ${item.partOfSpeech}: ${definition || "Indisponible"}`;
      }).join("\n\n");

      await m.reply(
        `╭─❖ 📖 𝐃𝐄𝐅𝐈𝐍𝐄 ❖─╮\n\n` +
        `│ Mot : ${entry.word}\n\n${meanings}\n\n` +
        `╰─────────────❖`
      );
    } catch (error) {
      console.error(error);
      m.reply("❌ Erreur pendant la recherche.");
    }
  }
};
