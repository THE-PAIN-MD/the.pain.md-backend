import {
  getMediaBuffer,
  sendImage,
  sharp,
  escapeSvg
} from "../../system/media.js";

export default {
  name: "meme",
  category: "media",

  async execute(sock, m, args) {
    try {
      const { buffer } = await getMediaBuffer(m, ["image"]);

      const text = args.join(" ").split("|");
      const top = escapeSvg(text[0] || "THE PAIN MD");
      const bottom = escapeSvg(text[1] || "");

      const metadata = await sharp(buffer).metadata();
      const width = Math.min(metadata.width || 512, 1200);
      const height = Math.min(metadata.height || 512, 1200);

      const svg = `
        <svg width="${width}" height="${height}">
          <style>
            .meme {
              font-family: Impact, Arial, sans-serif;
              font-size: ${Math.max(24, width / 12)}px;
              font-weight: bold;
              fill: white;
              stroke: black;
              stroke-width: 3px;
              paint-order: stroke;
              text-anchor: middle;
            }
          </style>
          <text x="50%" y="12%" class="meme">${top}</text>
          <text x="50%" y="92%" class="meme">${bottom}</text>
        </svg>
      `;

      const result = await sharp(buffer)
        .resize(width, height, { fit: "cover" })
        .composite([{ input: Buffer.from(svg) }])
        .jpeg({ quality: 90 })
        .toBuffer();

      await sendImage(sock, m, result, "😂 Meme créé par THE PAIN MD");
    } catch (err) {
      await m.reply(`❌ ${err.message}`);
    }
  }
};
