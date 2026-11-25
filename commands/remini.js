
import { getMediaBuffer, sendImage, sharp } from "../system/media.js";

export default {
  name: "remini",
  category: "media",

  async execute(sock, m) {
    try {
      const { buffer } = await getMediaBuffer(m, ["image"]);
      const metadata = await sharp(buffer).metadata();

      const result = await sharp(buffer)
        .resize({
          width: Math.min((metadata.width || 512) * 2, 2000),
          height: Math.min((metadata.height || 512) * 2, 2000),
          fit: "inside",
          withoutEnlargement: false
        })
        .normalize()
        .sharpen()
        .jpeg({ quality: 95 })
        .toBuffer();

      await sendImage(sock, m, result, "✨ Image améliorée par THE PAIN MD");
    } catch (err) {
      await m.reply(`❌ ${err.message}`);
    }
  }
};
