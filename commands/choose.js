
export default {
  name: "choose",
  category: "FUN",
  description: "Choisir une option au hasard",

  async execute(sock, m, args) {
    const options = args.join(" ").split("|")
      .map(x => x.trim())
      .filter(Boolean);

    if (options.length < 2) {
      return m.reply("❌ Exemple : .choose Pizza | Burger | Tacos");
    }

    const choice = options[Math.floor(Math.random() * options.length)];

    await m.reply(
      `╭─❖ 🎲 𝐂𝐇𝐎𝐎𝐒𝐄 ❖─╮\n\n` +
      `Options : ${options.join(" / ")}\n\n` +
      `👑 Mon choix : *${choice}*\n\n` +
      `╰─────────────❖`
    );
  }
};
