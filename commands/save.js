import { getQuotedMedia } from "../system/getQuotedMedia.js";

export default {
  name: "save",
  category: "media",
  description: "Vole le média vue unique et l'envoie en DM privé",

  async execute(sock, m, args) {
    const quotedMedia = getQuotedMedia(m);
    
    if (!quotedMedia) return m.reply("❌ Réponds à un média vue unique pour le voler en privé !");

    const isViewOnce = m.quoted && (
      m.quoted.message?.viewOnceMessage || 
      m.quoted.message?.viewOnceMessageV2 || 
      m.quoted.message?.viewOnceMessageV2Extension
    );

    if (!isViewOnce) return m.reply("❌ Ce n'est pas un média vue unique !");

    const mediaType = quotedMedia.type;
    const mediaData = quotedMedia.message;
    const caption = mediaData.caption || "";
    const targetJid = m.sender;

    try {
      if (mediaType === "image") {
        await sock.sendMessage(targetJid, { image: { url: mediaData.url || mediaData.downloadURL }, caption: `🔒 *SAVED PRIVATELY* 🔒\n\n${caption}` });
      } else if (mediaType === "video") {
        await sock.sendMessage(targetJid, { video: { url: mediaData.url || mediaData.downloadURL }, caption: `🔒 *SAVED PRIVATELY* 🔒\n\n${caption}` });
      } else if (mediaType === "audio") {
        await sock.sendMessage(targetJid, { audio: { url: mediaData.url || mediaData.downloadURL }, mimetype: "audio/mpeg", ptt: true });
      }

      await m.reply("✅ Le secret a été transféré dans tes DM !");
    } catch (e) {
      return m.reply(`❌ Échec du vol : ${e.message}`);
    }
  }
};
