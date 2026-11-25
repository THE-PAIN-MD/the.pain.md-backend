import { getQuotedMedia } from "../system/getQuotedMedia.js";

export default {
  name: "vv",
  category: "media",
  description: "Extrait brutalement les médias vue unique dans le chat",

  async execute(sock, m, args) {
    const quotedMedia = getQuotedMedia(m);
    
    if (!quotedMedia) return m.reply("❌ Réponds à un média vue unique, vermine !");

    const msg = quotedMedia.message;
    
    // On vérifie si c'est un média vue unique (V1, V2 ou Extension)
    // Note: getQuotedMedia extrait le message, mais on doit vérifier s'il provient d'un wrapper ViewOnce
    const isViewOnce = m.quoted && (
      m.quoted.message?.viewOnceMessage || 
      m.quoted.message?.viewOnceMessageV2 || 
      m.quoted.message?.viewOnceMessageV2Extension
    );

    if (!isViewOnce) return m.reply("❌ Ce n'est pas un message 'vue unique'. Ne me fais pas perdre mon temps !");

    const mediaType = quotedMedia.type; // 'image', 'video', 'audio'
    const mediaData = msg;
    const caption = mediaData.caption || "";

    try {
      if (mediaType === "image") {
        await sock.sendMessage(m.chat, { image: { url: mediaData.url || mediaData.downloadURL }, caption: `🩸 *VV EXTRACTED* 🩸\n\n${caption}` }, { quoted: m });
      } else if (mediaType === "video") {
        await sock.sendMessage(m.chat, { video: { url: mediaData.url || mediaData.downloadURL }, caption: `🩸 *VV EXTRACTED* 🩸\n\n${caption}` }, { quoted: m });
      } else if (mediaType === "audio") {
        await sock.sendMessage(m.chat, { audio: { url: mediaData.url || mediaData.downloadURL }, mimetype: "audio/mpeg", ptt: true }, { quoted: m });
      } else {
        return m.reply("❌ Type de média non supporté pour l'extraction VV.");
      }
    } catch (e) {
      return m.reply(`❌ Erreur fatale : ${e.message}`);
    }
  }
};
