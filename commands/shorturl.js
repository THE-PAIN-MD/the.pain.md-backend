
export default {
  name: "shorturl",
  category: "UTILITY",
  description: "Raccourcir un lien",

  async execute(sock, m, args) {
    const url = args[0]?.trim();

    if (!url) {
      return m.reply("❌ Exemple : .shorturl https://google.com");
    }

    try {
      const parsed = new URL(url);

      if (!["http:", "https:"].includes(parsed.protocol)) {
        return m.reply("❌ Seuls les liens HTTP et HTTPS sont acceptés.");
      }

      const response = await fetch(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(parsed.href)}`
      );

      if (!response.ok) {
        return m.reply("❌ Impossible de raccourcir ce lien.");
      }

      const short = (await response.text()).trim();

      if (!short.startsWith("https://tinyurl.com/")) {
        return m.reply("❌ Le service a retourné un résultat invalide.");
      }

      await m.reply(
        `╭─❖ 🔗 𝐒𝐇𝐎𝐑𝐓 𝐔𝐑𝐋 ❖─╮\n\n` +
        `│ Original : ${parsed.href}\n` +
        `│ Court : ${short}\n\n` +
        `╰─────────────❖`
      );
    } catch (error) {
      console.error(error);
      m.reply("❌ Lien invalide ou service indisponible.");
    }
  }
};
