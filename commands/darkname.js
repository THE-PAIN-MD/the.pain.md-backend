
const fonts = [
  text => text.toUpperCase(),
  text => [...text].map(c => c === " " ? " " : ({
    A: "𝔄", B: "𝔅", C: "ℭ", D: "𝔇", E: "𝔈",
    F: "𝔉", G: "𝔊", H: "ℌ", I: "ℑ", J: "𝔍",
    K: "𝔎", L: "𝔏", M: "𝔐", N: "𝔑", O: "𝔒",
    P: "𝔓", Q: "𝔔", R: "ℜ", S: "𝔖", T: "𝔗",
    U: "𝔘", V: "𝔙", W: "𝔚", X: "𝔛", Y: "𝔜",
    Z: "ℨ"
  }[c.toUpperCase()] || c)).join(""),
  text => `『${text}』`,
  text => `亗 ${text} 亗`,
  text => `꧁ ${text} ꧂`
];

export default {
  name: "darkname",
  category: "DARK",
  description: "Transformer un nom en style sombre",

  async execute(sock, m, args) {
    const name = args.join(" ").trim();

    if (!name) {
      return m.reply("❌ Exemple : .darkname Moses");
    }

    const font = fonts[Math.floor(Math.random() * fonts.length)];

    await m.reply(
      `╭─❖ 🩸 𝐃𝐀𝐑𝐊 𝐍𝐀𝐌𝐄 ❖─╮\n\n${font(name)}\n\n╰─────────────❖`
    );
  }
};
