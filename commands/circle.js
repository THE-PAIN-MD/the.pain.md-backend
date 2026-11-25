import { getMediaBuffer, sendImage, sharp } from "../../system/media.js";

export default {
  name: "circle",
  category: "media",

  async execute(sock, m) {
    try {
      const { buffer } = await getMediaBuffer(m, ["image"]);

      const image = sharp(buffer);
      const metadata = await image.metadata();

      const size = Math.min(metadata.width, metadata.height);

      const circle = Buffer.from(`
        <svg width="${size}" height="${size}">
          <circle
            cx="${size / 2}"
            cy="${size / 2}"
            r="${size / 2}"
            fill="white"
          />
        </svg>
      `);

      const result = await image
        .resize(size, size, { fit: "cover", position: "centre" })
        .composite([{
          input: circle,
          blend: "dest-in"
        }])
        .png()
        .toBuffer();

      await sendImage(sock, m, result, "⭕ Image circulaire");
    } catch (err) {
      await m.reply(`❌ ${err.message}`);
    }
  }
};
