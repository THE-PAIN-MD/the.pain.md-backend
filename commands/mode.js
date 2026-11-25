
export default {
  name: "mode",
  aliases: ["botmode"],
  category: "owner",
  description: "Change le mode public ou privé du bot.",
  ownerOnly: true,

  async execute(sock, m, args, sessionContext = {}) {
    const requested = String(args[0] || "")
      .trim()
      .toLowerCase();

    const aliases = {
      public: "public",
      publique: "public",
      private: "private",
      prive: "private",
      privé: "private"
    };

    const mode = aliases[requested];

    if (!mode) {
      const current = String(
        sessionContext.mode ||
        sessionContext.botMode ||
        "private"
      ).toLowerCase();

      return m.reply([
        "╭━━〔 ⚙️ 𝐓𝐇𝐄 𝐏𝐀𝐈𝐍 𝐌𝐃 〕━━╮",
        "│",
        `│ MODE ACTUEL : ${current.toUpperCase()}`,
        "│",
        "│ .mode publique",
        "│ .mode private",
        "│",
        "╰━━━━━━━━━━━━━━━━━━━━━━╯"
      ].join("\n"));
    }

    sessionContext.mode = mode;
    sessionContext.botMode = mode;

    if (typeof sessionContext.saveSettings === "function") {
      await sessionContext.saveSettings();
    }

    return m.reply([
      "╭━━〔 🩸 𝐌𝐎𝐃𝐄 MODIFIÉ 〕━━╮",
      "│",
      `│ NOUVEAU MODE : ${mode.toUpperCase()}`,
      mode === "public"
        ? "│ Tout le monde peut utiliser les commandes."
        : "│ Seuls le propriétaire et les sudo peuvent utiliser les commandes.",
      "│",
      "╰━━━━━━━━━━━━━━━━━━━━━━╯"
    ].join("\n"));
  }
};
