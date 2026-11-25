
const quotes = [
  "Le silence est parfois la réponse la plus puissante.",
  "Ne confonds jamais ma patience avec une faiblesse.",
  "La confiance se construit lentement et se perd rapidement.",
  "Même dans l'obscurité, celui qui connaît son chemin avance.",
  "Les actes révèlent ce que les paroles tentent de cacher.",
  "Le respect ne se réclame pas, il se mérite.",
  "Apprends à observer avant de juger.",
  "La vraie force consiste aussi à savoir se maîtriser."
];

export default {
  name: "darkquote",
  category: "DARK",
  description: "Afficher une citation sombre",

  async execute(sock, m) {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    await m.reply(
      `╭─❖ 🩸 𝐃𝐀𝐑𝐊 𝐐𝐔𝐎𝐓𝐄 ❖─╮\n\n` +
      `❝ ${quote} ❞\n\n` +
      `╰─────────────❖\n` +
      `> POWERED BY 🩸𝐓𝐇𝐄 𝐏𝐀𝐈𝐍🩸`
    );
  }
};
