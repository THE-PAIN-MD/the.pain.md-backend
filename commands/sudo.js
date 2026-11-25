
export default {
  name: "sudo",
  category: "owner",
  description: "Ajoute un utilisateur à la liste SUDO.",
  ownerOnly: true,

  async execute(sock, m, args, sessionContext = {}) {
    const target = m.mentionedJid?.[0] || m.quoted?.sender || args[0]?.replace(/\D/g, "") + "@s.whatsapp.net";

    if (!target || target === "@s.whatsapp.net") {
      return m.reply("Mentionne un utilisateur ou donne son numéro.");
    }

    if (!(global.sudoUsers instanceof Set)) {
      global.sudoUsers = new Set();
    }

    global.sudoUsers.add(target);

    sessionContext.settings?.sudoUsers?.add(target);

    if (typeof sessionContext.saveSettings === "function") {
      await sessionContext.saveSettings();
    }

    return m.reply(
      `╭─❖ 🩸 𝐒𝐔𝐃𝐎 🩸 ❖─╮\n\n│ ͟͟͞ᬼ⃟─► 👤 𝐔𝐬𝐞𝐫 : @${target.split("@")[0]}\n│ ͟͟͞ᬼ⃟─► ✅ 𝐒𝐭𝐚𝐭𝐮𝐭 : SUDO ajouté\n\n╰─────────────❖`,
      { mentions: [target] }
    );
  }
};
