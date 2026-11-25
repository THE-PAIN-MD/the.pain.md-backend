
export default {
  name: "feedback",
  category: "general",
  description: "Envoie un feedback au développeur",

  async execute(sock, m, args) {
    const feedback = args.join(" ").trim();

    if (!feedback) {
      return m.reply(
        "❌ Écris ton avis après la commande.\n\nExemple : .feedback Le bot fonctionne très bien !"
      );
    }

    if (feedback.length > 1500) {
      return m.reply("❌ Ton feedback est trop long. Limite : 1500 caractères.");
    }

    const sender = m.sender || "Utilisateur inconnu";
    const name = m.pushName || "Utilisateur";

    const report = `
╭─❖ 🩸 𝐍𝐄𝐖 𝐅𝐄𝐄𝐃𝐁𝐀𝐂𝐊 🩸 ❖─╮

│ 👤 Nom : ${name}
│ 🆔 Utilisateur : ${sender}
│
│ 📝 Message :
│ ${feedback}
│
╰──────────────❖

> THE PAIN MD`;

    try {
      let owner = global.config?.OWNER;

      if (Array.isArray(owner)) {
        owner = owner[0];
      }

      if (owner) {
        const ownerJid = String(owner).includes("@")
          ? String(owner)
          : `${String(owner).replace(/\D/g, "")}@s.whatsapp.net`;

        await sock.sendMessage(ownerJid, { text: report });

        return m.reply("✅ Ton feedback a été envoyé au développeur. Merci !");
      }

      return m.reply(
        "⚠️ Feedback enregistré dans cette conversation, mais le numéro du propriétaire n'est pas configuré."
      );
    } catch (error) {
      console.error("[FEEDBACK ERROR]", error);
      return m.reply("❌ Impossible d'envoyer ton feedback pour le moment.");
    }
  }
};
