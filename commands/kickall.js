
export default {
  name: "kickall",
  category: "owner",
  description: "Expulse les membres non-administrateurs.",
  ownerOnly: true,
  admin: true,
  botAdmin: true,

  async execute(sock, m, args) {
    if (args[0] !== "confirm") {
      return m.reply(
        "╭─❖ 🩸 𝐊𝐈𝐂𝐊𝐀𝐋𝐋 🩸 ❖─╮\n\n" +
        "│ ͟͟͞ᬼ⃟─► ⚠️ Cette action expulse tous les membres non-admins.\n" +
        "│ ͟͟͞ᬼ⃟─► Les administrateurs seront protégés.\n" +
        "│\n" +
        "│ ͟͟͞ᬼ⃟─► Confirmation : .kickall confirm\n\n" +
        "╰─────────────❖"
      );
    }

    const metadata = await sock.groupMetadata(m.chat);
    const botId = sock.user.id.split(":")[0].split("@")[0];

    const targets = metadata.participants
      .filter(p => !p.admin && p.id.split("@")[0].split(":")[0] !== botId)
      .map(p => p.id);

    if (!targets.length) {
      return m.reply("Aucun membre non-administrateur à expulser.");
    }

    let removed = 0;

    for (const target of targets) {
      try {
        await sock.groupParticipantsUpdate(m.chat, [target], "remove");
        removed++;
      } catch (error) {
        console.error("[KICKALL]", error);
      }
    }

    return m.reply(
      `╭─❖ 🩸 𝐊𝐈𝐂𝐊𝐀𝐋𝐋 🩸 ❖─╮\n\n│ ͟͟͞ᬼ⃟─► 👥 𝐂𝐢𝐛𝐥𝐞𝐬 : ${targets.length}\n│ ͟͟͞ᬼ⃟─► ✅ 𝐄𝐱𝐩𝐮𝐥𝐬𝐢𝐨𝐧𝐬 : ${removed}\n│ ͟͟͞ᬼ⃟─► 👑 𝐀𝐝𝐦𝐢𝐧𝐬 : Protégés\n\n╰─────────────❖`
    );
  }
};
