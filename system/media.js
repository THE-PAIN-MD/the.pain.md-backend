
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { getQuotedMedia } from "./getQuotedMedia.js";
import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";
import { spawn } from "node:child_process";

export async function getMediaBuffer(m, allowed = []) {
  const media = getQuotedMedia(m);

  if (!media || (allowed.length && !allowed.includes(media.type))) {
    throw new Error(
      `Réponds à un média : ${allowed.join(", ") || "image, vidéo ou audio"}.`
    );
  }

  const stream = await downloadContentFromMessage(
    media.message,
    media.type
  );

  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return {
    buffer: Buffer.concat(chunks),
    type: media.type
  };
}

export async function sendImage(sock, m, buffer, caption = "") {
  return sock.sendMessage(
    m.chat,
    { image: buffer, caption },
    { quoted: m }
  );
}

export async function sendAudio(sock, m, buffer) {
  return sock.sendMessage(
    m.chat,
    {
      audio: buffer,
      mimetype: "audio/mpeg",
      fileName: "THE-PAIN.mp3",
      ptt: false
    },
    { quoted: m }
  );
}

export async function convertMedia(buffer, args) {
  if (!ffmpegPath) {
    throw new Error("FFmpeg indisponible.");
  }

  return new Promise((resolve, reject) => {
    const process = spawn(ffmpegPath, args);
    const chunks = [];
    let error = "";

    process.stdout.on("data", chunk => chunks.push(chunk));

    process.stderr.on("data", chunk => {
      error += chunk.toString();
    });

    process.on("error", reject);

    process.on("close", code => {
      if (code !== 0) {
        return reject(
          new Error(error.slice(-1000) || "Conversion échouée.")
        );
      }

      resolve(Buffer.concat(chunks));
    });

    process.stdin.end(buffer);
  });
}

export function escapeSvg(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export { sharp };
