
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { Sticker, StickerTypes } from "wa-sticker-formatter";

export default {
  name: "take",
  aliases: ["steal"],
  category: "media",
  description: "Modifie le pack et l'auteur d'un sticker.",

  async execute(sock, m, args) {
    try {
      const raw = m.raw || m;
      const context =
        raw.message?.extendedTextMessage?.contextInfo;

      const quotedMessage = context?.quotedMessage;

      if (!quotedMessage?.stickerMessage) {
        return m.reply(
          "╭─❖ 🩸 𝐓𝐀𝐊𝐄 🩸 ❖─╮\n\n" +
          "│ ͟͟͞ᬼ⃟─► Réponds à un sticker.\n" +
          "│ ͟͟͞ᬼ⃟─► .take NomDuPack\n" +
          "│ ͟͟͞ᬼ⃟─► Sans nom : utilise ton nom WhatsApp.\n\n" +
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

      const metadata = await sock.groupMetadata(m.chat).catch(() => null);

      const author =
        m.pushName ||
        m.sender?.split("@")[0] ||
        "Utilisateur";

      const packName = args.join(" ").trim() || author;

      const sticker = new Sticker(buffer, {
        pack: packName,
        author: "𝐓𝐇𝐄 𝐏𝐀𝐈𝐍 𝐌𝐃",
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
      console.error("[TAKE]", error);
      return m.reply("❌ Impossible de modifier ce sticker.");
    }
  }
};
