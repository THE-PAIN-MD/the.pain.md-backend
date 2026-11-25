
export default {
  name: "mode",
  category: "owner",
  description: "Change le mode du bot.",
  ownerOnly: true,

  async execute(sock, m, args, sessionContext = {}) {
    const mode = (args[0] || "").toLowerCase();

    if (!["private", "public"].includes(mode)) {
      return m.reply(
        "╭─❖ 🩸 𝐌𝐎𝐃𝐄 🩸 ❖─╮\n\n│ ͟͟͞ᬼ⃟─► .mode private\n│ ͟͟͞ᬼ⃟─► .mode public\n\n╰─────────────❖"
      );
    }

    sessionContext.mode = mode;
    sessionContext.botMode = mode;

    if (typeof sessionContext.saveSettings === "function") {
      await sessionContext.saveSettings();
    }

    return m.reply(
      `╭─❖ 🩸 𝐌𝐎𝐃𝐄 🩸 ❖─╮\n\n│ ͟͟͞ᬼ⃟─► ⚙️ 𝐍𝐨𝐮𝐯𝐞𝐚𝐮 𝐦𝐨𝐝𝐞 : ${mode.toUpperCase()}\n│ ͟͟͞ᬼ⃟─► ✅ Modification demandée.\n\n╰─────────────❖`
    );
  }
};
