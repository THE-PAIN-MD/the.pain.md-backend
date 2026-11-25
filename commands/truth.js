
const questions = [
  "Quelle est ta plus grande peur ?",
  "Quel est ton rêve le plus important ?",
  "Quelle est la chose la plus drôle qui te soit arrivée ?",
  "Si tu pouvais voyager n'importe où, où irais-tu ?",
  "Quelle qualité apprécies-tu le plus chez un ami ?",
  "Quel talent aimerais-tu apprendre ?",
  "Quelle est ta plus grande fierté ?",
  "Quel personnage de fiction aimerais-tu rencontrer ?"
];

export default {
  name: "truth",
  category: "FUN",
  description: "Poser une question vérité",

  async execute(sock, m) {
    const question = questions[Math.floor(Math.random() * questions.length)];
    await m.reply(`╭─❖ 🎭 𝐓𝐑𝐔𝐓𝐇 ❖─╮\n\n${question}\n\n╰─────────────❖`);
  }
};
