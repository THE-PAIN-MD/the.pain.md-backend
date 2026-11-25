
const zones = {
  johannesburg: "Africa/Johannesburg",
  pretoria: "Africa/Johannesburg",
  kinshasa: "Africa/Kinshasa",
  lubumbashi: "Africa/Lubumbashi",
  london: "Europe/London",
  paris: "Europe/Paris",
  tokyo: "Asia/Tokyo",
  dubai: "Asia/Dubai",
  newyork: "America/New_York",
  sydney: "Australia/Sydney"
};

export default {
  name: "time",
  category: "UTILITY",
  description: "Afficher l'heure d'une ville",

  async execute(sock, m, args) {
    const city = args.join("").toLowerCase();

    if (!city) {
      return m.reply(
        "❌ Exemple : .time Johannesburg\n\nVilles : Johannesburg, Kinshasa, Paris, London, Tokyo, Dubai."
      );
    }

    const zone = zones[city];

    if (!zone) {
      return m.reply("❌ Ville non disponible dans la liste.");
    }

    const time = new Intl.DateTimeFormat("fr-FR", {
      timeZone: zone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(new Date());

    return m.reply(
      `╭─❖ 🕒 𝐋𝐎𝐂𝐀𝐋 𝐓𝐈𝐌𝐄 ❖─╮\n\n` +
      `│ Ville : ${city}\n` +
      `│ Heure : ${time}\n\n` +
      `╰─────────────❖`
    );
  }
};
