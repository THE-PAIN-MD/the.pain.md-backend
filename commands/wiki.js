
export default {
  name: "wiki",
  category: "UTILITY",
  description: "Rechercher sur Wikipédia",

  async execute(sock, m, args) {
    const query = args.join(" ").trim();

    if (!query) {
      return m.reply("❌ Exemple : .wiki Naruto");
    }

    try {
      const url =
        `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

      const response = await fetch(url);

      if (!response.ok) {
        return m.reply("❌ Aucun résultat trouvé.");
      }

      const data = await response.json();

      await m.reply(
        `╭─❖ 📚 𝐖𝐈𝐊𝐈 ❖─╮\n\n` +
        `│ Titre : ${data.title}\n\n` +
        `${data.extract || "Aucun résumé disponible."}\n\n` +
        `🔗 ${data.content_urls?.desktop?.page || ""}\n\n` +
        `╰─────────────❖`
      );
    } catch (error) {
      console.error(error);
      m.reply("❌ Erreur pendant la recherche Wikipédia.");
    }
  }
};
