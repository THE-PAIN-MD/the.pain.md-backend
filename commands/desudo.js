
export default {
  name: "desudo",
  category: "owner",
  description: "Retire un utilisateur de la liste SUDO.",
  ownerOnly: true,

  async execute(sock, m, args, sessionContext = {}) {
    const target = m.mentionedJid?.[0] || m.quoted?.sender || args[0]?.replace(/\D/g, "") + "@s.whatsapp.net";

    if (!target || target === "@s.whatsapp.net") {
      return m.reply("Mentionne un utilisateur ou donne son numéro.");
    }

    global.sudoUsers?.delete(target);
    sessionContext.settings?.sudoUsers?.delete(target);

    if (typeof sessionContext.saveSettings === "function") {
      await sessionContext.saveSettings();
    }

    return m.reply(
      `╭─❖ 🩸 𝐃𝐄𝐒𝐔𝐃𝐎 🩸 ❖─╮\n\n│ ͟͟͞ᬼ⃟─► 👤 𝐔𝐬𝐞𝐫 : @${target.split("@")[0]}\n│ ͟͟͞ᬼ⃟─► ✅ 𝐒𝐭𝐚𝐭𝐮𝐭 : SUDO retiré\n\n╰─────────────❖`,
      { mentions: [target] }
    );
  }
};
