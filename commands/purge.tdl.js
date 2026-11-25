
export default {
  name: "purge.tdl",
  category: "group",
  description: "Transformer un groupe aux couleurs de THE DARK LEGION",

  async execute(sock, m, args) {
    if (!m.isGroup) {
      return m.reply("❌ Cette commande fonctionne uniquement dans un groupe.");
    }

    try {
      const metadata = await sock.groupMetadata(m.chat);

      const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
      const bot = metadata.participants.find(
        p => p.id === botJid || p.jid === botJid
      );

      if (!bot?.admin) {
        return m.reply("❌ Le bot doit être administrateur du groupe.");
      }

      const oldName = metadata.subject || "Groupe";
      const newName = `${oldName} DARKED BY THE DARK LEGION`;

      const description =
        "🩸 DARKED BY THE DARK LEGION 🩸\n\n" +
        "Ce groupe entre désormais dans l'univers de THE DARK LEGION.\n\n" +
        "👑 FONDATEUR : THE PAIN\n" +
        "⚔️ DEVISE : TDL RÈGNE — TDL DOMINE — TDL CONTROL\n\n" +
        "POWERED BY THE PAIN MD";

      await sock.groupUpdateSubject(m.chat, newName);
      await sock.groupUpdateDescription(m.chat, description);

      await sock.sendMessage(m.chat, {
        text:
          "╭─❖ 🩸 𝐓𝐃𝐋 𝐏𝐔𝐑𝐆𝐄 🩸 ❖─╮\n\n" +
          "│ ͟͟͞ᬼ⃟─► 𝐀𝐍𝐂𝐈𝐄𝐍 𝐍𝐎𝐌 : " + oldName + "\n" +
          "│ ͟͟͞ᬼ⃟─► 𝐍𝐎𝐔𝐕𝐄𝐀𝐔 𝐍𝐎𝐌 : " + newName + "\n" +
          "│ ͟͟͞ᬼ⃟─► 👥 𝐌𝐄𝐌𝐁𝐑𝐄𝐒 : " + metadata.participants.length + "\n" +
          "│ ͟͟͞ᬼ⃟─► 🩸 𝐒𝐓𝐀𝐓𝐔𝐓 : GROUPE TRANSFORMÉ\n" +
          "│ ͟͟͞ᬼ⃟─► 👑 𝐃𝐄𝐕 : THE PAIN\n\n" +
          "╰─────────────❖\n\n" +
          "🩸 DARKED BY THE DARK LEGION 🩸"
      }, { quoted: m });

    } catch (error) {
      console.error("[PURGE TDL ERROR]", error);

      return m.reply(
        "❌ Échec de la transformation : " + error.message
      );
    }
  }
};
