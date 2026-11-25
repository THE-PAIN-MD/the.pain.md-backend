
export default {
  name: "mute",
  category: "admin",
  description: "Active le mode silencieux du groupe.",
  admin: true,
  botAdmin: true,

  async execute(sock, m, args, sessionContext = {}) {
    if (!(global.mutedGroups instanceof Set)) {
      global.mutedGroups = new Set();
    }

    global.mutedGroups.add(m.chat);

    if (sessionContext.settings?.mutedGroups instanceof Set) {
      sessionContext.settings.mutedGroups.add(m.chat);
    }

    if (typeof sessionContext.saveSettings === "function") {
      await sessionContext.saveSettings();
    }

    return m.reply(
      "╭─❖ 🩸 𝐌𝐔𝐓𝐄 🩸 ❖─╮\n\n│ ͟͟͞ᬼ⃟─► 🔇 𝐒𝐭𝐚𝐭𝐮𝐭 : ACTIVÉ\n│ ͟͟͞ᬼ⃟─► Le groupe passe en mode silencieux.\n\n╰─────────────❖"
    );
  }
};
