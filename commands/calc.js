
export default {
  name: "calc",
  category: "UTILITY",
  description: "Effectuer un calcul",

  async execute(sock, m, args) {
    const expression = args.join("").trim();

    if (!expression) {
      return m.reply("❌ Exemple : .calc 25 * 4");
    }

    if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
      return m.reply("❌ Expression invalide.");
    }

    try {
      const result = Function(`"use strict"; return (${expression})`)();

      if (!Number.isFinite(result)) {
        return m.reply("❌ Calcul impossible.");
      }

      return m.reply(
        `╭─❖ 🧮 𝐂𝐀𝐋𝐂 ❖─╮\n\n` +
        `│ Calcul : ${expression}\n` +
        `│ Résultat : ${result}\n\n` +
        `╰─────────────❖`
      );
    } catch {
      return m.reply("❌ Expression mathématique incorrecte.");
    }
  }
};
