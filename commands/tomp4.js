import { getMediaBuffer, convertMedia } from "../../system/media.js";

export default {
  name: "tomp4",
  category: "media",

  async execute(sock, m) {
    try {
      const { buffer } = await getMediaBuffer(m, ["video"]);

      const video = await convertMedia(buffer, [
        "-i", "pipe:0",
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-movflags", "frag_keyframe+empty_moov",
        "-f", "mp4",
        "pipe:1"
      ]);

      await sock.sendMessage(
        m.chat,
        {
          video,
          mimetype: "video/mp4",
          fileName: "THE-PAIN.mp4"
        },
        { quoted: m }
      );
    } catch (err) {
      await m.reply(`❌ ${err.message}`);
    }
  }
};
