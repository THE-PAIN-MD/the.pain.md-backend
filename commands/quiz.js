
const questions = [
  {
    question: "Quelle est la capitale du Japon ?",
    options: ["Séoul", "Tokyo", "Pékin", "Bangkok"],
    answer: 1
  },
  {
    question: "Combien de joueurs une équipe de football a-t-elle sur le terrain au début d'un match ?",
    options: ["9", "10", "11", "12"],
    answer: 2
  },
  {
    question: "Dans Naruto, quel est le village de Naruto ?",
    options: ["Suna", "Konoha", "Kiri", "Iwa"],
    answer: 1
  },
  {
    question: "Quelle planète est surnommée la planète rouge ?",
    options: ["Mars", "Vénus", "Jupiter", "Mercure"],
    answer: 0
  }
];

export default {
  name: "quiz",
  category: "FUN",
  description: "Lancer une question quiz",

  async execute(sock, m) {
    const q = questions[Math.floor(Math.random() * questions.length)];

    const poll = await sock.sendMessage(m.chat, {
      poll: {
        name: `🧠 ${q.question}`,
        values: q.options,
        selectableCount: 1
      }
    }, { quoted: m });

    await m.reply("⏳ Le quiz est lancé ! La réponse sera révélée dans 30 secondes.");

    setTimeout(async () => {
      try {
        await sock.sendMessage(m.chat, {
          text: `╭─❖ 🏆 𝐐𝐔𝐈𝐙 𝐑𝐄𝐒𝐔𝐋𝐓 ❖─╮\n\nBonne réponse : *${q.options[q.answer]}*\n\n╰─────────────❖`,
          quoted: poll
        });
      } catch (error) {
        console.error("QUIZ RESULT ERROR:", error);
      }
    }, 30000);
  }
};
