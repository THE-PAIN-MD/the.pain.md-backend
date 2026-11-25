
import { getMediaBuffer, convertMedia, sendAudio } from "../system/media.js";

export default {
  name: "toaudio",
  category: "media",

  async execute(sock, m) {
    try {
      const { buffer } = await getMediaBuffer(m, ["video"]);

      const audio = await convertMedia(buffer, [
        "-i", "pipe:0",
        "-vn",
        "-f", "mp3",
        "-codec:a", "libmp3lame",
        "-b:a", "192k",
        "pipe:1"
      ]);

      await sendAudio(sock, m, audio);
    } catch (err) {
      await m.reply(`❌ ${err.message}`);
    }
  }
};
