
const stories = [
  {
    title: "Le dernier message",
    text: "Il avait toujours quelque chose à dire, mais choisissait le silence. Un jour, tout le monde remarqua son absence. C'est alors qu'ils comprirent que certaines présences étaient plus précieuses qu'ils ne le pensaient."
  },
  {
    title: "L'observateur",
    text: "Dans une pièce remplie de voix, il préférait écouter. Il observait les gestes, retenait les détails et apprenait de chaque expérience. Il avait compris qu'on pouvait beaucoup découvrir sans chercher à tout raconter."
  },
  {
    title: "Le retour",
    text: "On pensait que son histoire était terminée. Pourtant, il avait simplement pris le temps de réfléchir, d'apprendre et de préparer la suite. Son retour ne fut pas une promesse : ce furent ses actions qui parlèrent."
  },
  {
    title: "La couronne invisible",
    text: "Il n'avait ni couronne ni trône. Pourtant, il avançait avec une détermination que personne ne pouvait lui retirer. Il savait qu'un véritable leader n'a pas besoin de rabaisser les autres pour montrer sa valeur."
  }
];

export default {
  name: "darkstory",
  category: "DARK",
  description: "Partager une histoire sombre",

  async execute(sock, m) {
    const story = stories[Math.floor(Math.random() * stories.length)];

    await m.reply(
      `╭─❖ 📖 𝐃𝐀𝐑𝐊 𝐒𝐓𝐎𝐑𝐘 ❖─╮\n\n` +
      `𝐓𝐢𝐭𝐫𝐞 : ${story.title}\n\n` +
      `${story.text}\n\n` +
      `╰─────────────❖`
    );
  }
};
