
export default {
  name: "goodbye",
  aliases: ["depart"],
  category: "group",
  description: "Active ou désactive les messages de départ.",

  async execute(sock, m, args, sessionContext = {}) {
    if (!m.isGroup) {
      return m.reply("╭─❖ 🩸 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 🩸 ❖─╮\n│ ͟͟͞ᬼ⃟─► Cette commande est réservée aux groupes.\n╰─────────────❖");
    }

    const action = (args[0] || "").toLowerCase();

    if (!["on", "off"].includes(action)) {
      return m.reply(
        "╭─❖ 🩸 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 🩸 ❖─╮\n" +
        "│\n" +
        "│ ͟͟͞ᬼ⃟─► ⚙️ 𝐔𝐭𝐢𝐥𝐢𝐬𝐚𝐭𝐢𝐨𝐧 :\n" +
        "│\n" +
        "│ ͟͟͞ᬼ⃟─► .goodbye on\n" +
        "│ ͟͟͞ᬼ⃟─► 🩸 Active les départs.\n" +
        "│\n" +
        "│ ͟͟͞ᬼ⃟─► .goodbye off\n" +
        "│ ͟͟͞ᬼ⃟─► Désactive les départs.\n" +
        "│\n" +
        "╰─────────────❖"
      );
    }

    if (!(global.goodbyeGroups instanceof Set)) {
      global.goodbyeGroups = new Set();
    }

    if (action === "on") {
      global.goodbyeGroups.add(m.chat);
    } else {
      global.goodbyeGroups.delete(m.chat);
    }

    try {
      if (typeof sessionContext.saveSettings === "function") {
        await sessionContext.saveSettings();
      }
    } catch (error) {
      console.error("[GOODBYE] Erreur sauvegarde :", error);
    }

    return m.reply(
      action === "on"
        ? "╭─❖ 🩸 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 🩸 ❖─╮\n│\n│ ͟͟͞ᬼ⃟─► ✅ 𝐒𝐭𝐚𝐭𝐮𝐭 : ACTIVÉ\n│ ͟͟͞ᬼ⃟─► Les départs seront annoncés.\n│\n╰─────────────❖"
        : "╭─❖ 🩸 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 🩸 ❖─╮\n│\n│ ͟͟͞ᬼ⃟─► ❌ 𝐒𝐭𝐚𝐭𝐮𝐭 : DÉSACTIVÉ\n│ ͟͟͞ᬼ⃟─► Les départs ne seront plus annoncés.\n│\n╰─────────────❖"
    );
  }
};
