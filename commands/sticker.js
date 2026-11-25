
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { Sticker, StickerTypes } from "wa-sticker-formatter";

export default {
  name: "sticker",
  aliases: ["s"],
  category: "media",
  description: "Transforme une image en sticker.",

  async execute(sock, m) {
    try {
      const raw = m.raw || m;
      const context =
        raw.message?.extendedTextMessage?.contextInfo;

      const quotedMessage = context?.quotedMessage;

      if (!quotedMessage) {
        return m.reply(
          "╭─❖ 🩸 𝐒𝐓𝐈𝐂𝐊𝐄𝐑 🩸 ❖─╮\n\n" +
          "│ ͟͟͞ᬼ⃟─► Réponds à une image pour créer un sticker.\n\n" +
          "╰─────────────❖"
        );
      }

      const mediaKey = Object.keys(quotedMessage).find(key =>
        ["imageMessage", "videoMessage"].includes(key)
      );

      if (!mediaKey) {
        return m.reply("Seules les images sont prises en charge pour le moment.");
      }

      const quoted = {
        key: {
          remoteJid: m.chat,
          fromMe: false,
          id: context.stanzaId,
          participant: context.participant
        },
        message: quotedMessage
      };

      const buffer = await downloadMediaMessage(
        quoted,
        "buffer",
        {},
        { logger: console }
      );

      const sticker = new Sticker(buffer, {
        pack: "𝐓𝐇𝐄 𝐏𝐀𝐈𝐍 𝐌𝐃",
        author: "⏤͟͟͞𝐓𝐇𝐄 ➪ 𝐏𝐀𝐈𝐍 ᭄",
        type: StickerTypes.FULL,
        quality: 75
      });

      const output = await sticker.toBuffer();

      await sock.sendMessage(
        m.chat,
        { sticker: output },
        { quoted: m }
      );

    } catch (error) {
      console.error("[STICKER]", error);
      return m.reply("❌ Impossible de créer le sticker.");
    }
  }
};
