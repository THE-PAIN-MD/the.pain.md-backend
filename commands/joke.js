
const jokes = [
  "Pourquoi les plongeurs plongent-ils toujours en arrière ? Parce que sinon ils tombent dans le bateau ! 😂",
  "Pourquoi les ordinateurs ont-ils froid ? Parce qu'ils laissent leurs fenêtres ouvertes !",
  "Quel est le comble pour un électricien ? Ne pas être au courant !",
  "Pourquoi les livres ont-ils toujours chaud ? Parce qu'ils ont une couverture !",
  "Que dit un mur à un autre mur ? On se retrouve à l'angle !"
];

export default {
  name: "joke",
  category: "FUN",
  description: "Envoyer une blague",

  async execute(sock, m) {
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    await m.reply(`╭─❖ 😂 𝐉𝐎𝐊𝐄 ❖─╮\n\n${joke}\n\n╰─────────────❖`);
  }
};
