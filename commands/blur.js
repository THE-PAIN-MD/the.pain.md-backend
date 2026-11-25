
import { getMediaBuffer, sendImage, sharp } from "../system/media.js";

export default {
  name: "blur",
  category: "media",

  async execute(sock, m) {
    try {
      const { buffer } = await getMediaBuffer(m, ["image"]);

      const result = await sharp(buffer)
        .blur(12)
        .jpeg({ quality: 90 })
        .toBuffer();

      await sendImage(sock, m, result, "🩸 Image floutée par THE PAIN MD");
    } catch (err) {
      await m.reply(`❌ ${err.message}`);
    }
  }
};
