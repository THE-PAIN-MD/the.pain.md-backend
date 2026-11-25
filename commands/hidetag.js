
export default {
  name: "hidetag",
  category: "GROUPE",
  description: "Mentionner tous les membres discrètement",

  async execute(sock, m, args) {
    if (!m.isGroup) {
      return m.reply("❌ Cette commande fonctionne uniquement dans un groupe.");
    }

    const text = args.join(" ").trim();

    if (!text) {
      return m.reply(
        "❌ Ajoute un message.\n\nExemple : .hidetag Réunion dans 5 minutes !"
      );
    }

    try {
      const metadata = await sock.groupMetadata(m.chat);
      const mentions = metadata.participants.map(p => p.id);

      await sock.sendMessage(
        m.chat,
        {
          text:
            `╭─❖ 🩸 𝐇𝐈𝐃𝐄 𝐓𝐀𝐆 🩸 ❖─╮\n\n` +
            `│ ͟͟͞ᬼ⃟─► ${text}\n\n` +
            `╰─────────────❖`,
          mentions
        },
        { quoted: m }
      );
    } catch (error) {
      console.error("HIDETAG ERROR:", error);
      return m.reply("❌ Impossible d'envoyer le hidetag.");
    }
  }
};
