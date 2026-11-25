
export default {
  name: "date",
  category: "UTILITY",
  description: "Afficher la date actuelle",

  async execute(sock, m) {
    const date = new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Africa/Kinshasa",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date());

    await m.reply(
      `╭─❖ 📅 𝐃𝐀𝐓𝐄 ❖─╮\n\n` +
      `│ Aujourd'hui : ${date}\n\n` +
      `╰─────────────❖`
    );
  }
};
