
export default {
  name: "welcome",
  aliases: ["bienvenue"],
  category: "group",
  description: "Active ou désactive les messages d'arrivée.",

  async execute(sock, m, args, sessionContext = {}) {
    if (!m.isGroup) {
      return m.reply("╭─❖ 🩸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🩸 ❖─╮\n│ ͟͟͞ᬼ⃟─► Cette commande est réservée aux groupes.\n╰─────────────❖");
    }

    const action = (args[0] || "").toLowerCase();

    if (!["on", "off"].includes(action)) {
      return m.reply(
        "╭─❖ 🩸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🩸 ❖─╮\n" +
        "│\n" +
        "│ ͟͟͞ᬼ⃟─► ⚙️ 𝐔𝐭𝐢𝐥𝐢𝐬𝐚𝐭𝐢𝐨𝐧 :\n" +
        "│\n" +
        "│ ͟͟͞ᬼ⃟─► .welcome on\n" +
        "│ ͟͟͞ᬼ⃟─► 🩸 Active les arrivées.\n" +
        "│\n" +
        "│ ͟͟͞ᬼ⃟─► .welcome off\n" +
        "│ ͟͟͞ᬼ⃟─► Désactive les arrivées.\n" +
        "│\n" +
        "╰─────────────❖"
      );
    }

    if (!(global.welcomeGroups instanceof Set)) {
      global.welcomeGroups = new Set();
    }

    if (action === "on") {
      global.welcomeGroups.add(m.chat);
    } else {
      global.welcomeGroups.delete(m.chat);
    }

    try {
      if (typeof sessionContext.saveSettings === "function") {
        await sessionContext.saveSettings();
      }
    } catch (error) {
      console.error("[WELCOME] Erreur sauvegarde :", error);
    }

    return m.reply(
      action === "on"
        ? "╭─❖ 🩸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🩸 ❖─╮\n│\n│ ͟͟͞ᬼ⃟─► ✅ 𝐒𝐭𝐚𝐭𝐮𝐭 : ACTIVÉ\n│ ͟͟͞ᬼ⃟─► 🩸 Les nouveaux membres seront accueillis.\n│\n╰─────────────❖"
        : "╭─❖ 🩸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🩸 ❖─╮\n│\n│ ͟͟͞ᬼ⃟─► ❌ 𝐒𝐭𝐚𝐭𝐮𝐭 : DÉSACTIVÉ\n│ ͟͟͞ᬼ⃟─► Les arrivées ne seront plus annoncées.\n│\n╰─────────────❖"
    );
  }
};
