
const dares = [
  "Envoie un compliment sincère à un membre du groupe.",
  "Écris une phrase entière sans utiliser la lettre A.",
  "Raconte une anecdote amusante.",
  "Fais deviner ton film préféré avec trois indices.",
  "Écris ton prénom à l'envers.",
  "Partage une chanson que tu apprécies.",
  "Décris ta journée avec seulement trois emojis.",
  "Fais une phrase avec les trois premiers emojis de ton clavier."
];

export default {
  name: "dare",
  category: "FUN",
  description: "Proposer un défi amusant",

  async execute(sock, m) {
    const dare = dares[Math.floor(Math.random() * dares.length)];
    await m.reply(`╭─❖ 🎯 𝐃𝐀𝐑𝐄 ❖─╮\n\n${dare}\n\n╰─────────────❖`);
  }
};
