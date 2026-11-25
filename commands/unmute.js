
export default {
  name: "unmute",
  category: "admin",
  description: "Désactive le mode silencieux.",
  admin: true,
  botAdmin: true,
  allowWhenMuted: true,

  async execute(sock, m, args, sessionContext = {}) {
    global.mutedGroups?.delete(m.chat);
    sessionContext.settings?.mutedGroups?.delete(m.chat);

    if (typeof sessionContext.saveSettings === "function") {
      await sessionContext.saveSettings();
    }

    return m.reply(
      "╭─❖ 🩸 𝐔𝐍𝐌𝐔𝐓𝐄 🩸 ❖─╮\n\n│ ͟͟͞ᬼ⃟─► 🔊 𝐒𝐭𝐚𝐭𝐮𝐭 : DÉSACTIVÉ\n│ ͟͟͞ᬼ⃟─► Le groupe peut à nouveau discuter.\n\n╰─────────────❖"
    );
  }
};
