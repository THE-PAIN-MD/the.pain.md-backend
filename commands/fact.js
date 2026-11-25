
const facts = [
  "Les pieuvres ont trois cœurs.",
  "Le miel peut se conserver très longtemps lorsqu'il est bien stocké.",
  "Les dauphins utilisent des sons pour communiquer.",
  "Une journée sur Vénus est plus longue que son année.",
  "Les bananes sont des baies du point de vue botanique.",
  "Les requins existent depuis bien avant les dinosaures.",
  "Les flamants roses doivent leur couleur à leur alimentation."
];

export default {
  name: "fact",
  category: "FUN",
  description: "Partager un fait intéressant",

  async execute(sock, m) {
    const fact = facts[Math.floor(Math.random() * facts.length)];
    await m.reply(`╭─❖ 🧠 𝐅𝐀𝐂𝐓 ❖─╮\n\n${fact}\n\n╰─────────────❖`);
  }
};
