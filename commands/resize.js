import { getMediaBuffer, sendImage, sharp } from "../../system/media.js";

export default {
  name: "resize",
  category: "media",

  async execute(sock, m, args) {
    try {
      const { buffer } = await getMediaBuffer(m, ["image"]);

      const width = Math.max(64, Math.min(Number(args[0]) || 512, 2000));
      const height = Math.max(64, Math.min(Number(args[1]) || width, 2000));

      const result = await sharp(buffer)
        .resize(width, height, { fit: "inside" })
        .jpeg({ quality: 90 })
        .toBuffer();

      await sendImage(
        sock,
        m,
        result,
        `📐 Dimensions : ${width} × ${height}`
      );
    } catch (err) {
      await m.reply(`❌ ${err.message}`);
    }
  }
};
