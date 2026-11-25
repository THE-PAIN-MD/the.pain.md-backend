
import sharp from "sharp";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

export default {
  name: "photo",
  category: "media",
  description: "Convertit un sticker en image.",

  async execute(sock, m) {
    try {
      const raw = m.raw || m;
      const context =
        raw.message?.extendedTextMessage?.contextInfo;

      const quotedMessage = context?.quotedMessage;

      if (!quotedMessage?.stickerMessage) {
        return m.reply(
          "╭─❖ 🩸 𝐏𝐇𝐎𝐓𝐎 🩸 ❖─╮\n\n" +
          "│ ͟͟͞ᬼ⃟─► Réponds à un sticker pour le convertir en image.\n\n" +
          "╰─────────────❖"
        );
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

      const photo = await sharp(buffer)
        .png()
        .toBuffer();

      await sock.sendMessage(
        m.chat,
        {
          image: photo,
          caption:
            "╭─❖ 🩸 𝐏𝐇𝐎𝐓𝐎 🩸 ❖─╮\n\n" +
            "│ ͟͟͞ᬼ⃟─► ✅ Sticker converti en image.\n\n" +
            "╰─────────────❖"
        },
        { quoted: m }
      );

    } catch (error) {
      console.error("[PHOTO]", error);
      return m.reply("❌ Impossible de convertir ce sticker.");
    }
  }
};
