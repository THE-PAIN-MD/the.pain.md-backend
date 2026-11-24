
import dotenv from "dotenv";

dotenv.config();

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === "") {
    return defaultValue;
  }

  return value.toLowerCase() === "true";
};

const parseList = (value = "") => {
  return value
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
};

const config = {
  // ==========================================
  // IDENTITY
  // ==========================================

  BOT_NAME:
    "𝐓𝐇𝐄 𝐏𝐀𝐈𝐍 𝐌𝐃",

  PREFIX:
    process.env.PREFIX || ".",

  VERSION:
    "1.0.0",

  OWNER_NAME:
    "⏤͟͟͞𝐓𝐇𝐄 ➪ 𝐏𝐀𝐈𝐍 ᭄",

  OWNERS:
    parseList(process.env.OWNER_NUMBER)
      .map(number => number.replace(/\D/g, ""))
      .filter(Boolean),

  CHANNEL:
    process.env.CHANNEL_LINK ||
    "https://whatsapp.com/channel/0029Vb7FTvDICVfgeK27ul2S",

  // ==========================================
  // BOT MODE & PERMISSIONS
  // ==========================================

  MODE:
    (process.env.MODE || "private").toLowerCase(),

  DEFAULT_MODE:
    "private",

  // ==========================================
  // PAIN STYLE
  // ==========================================

  PAIN_THEME:
    parseBoolean(process.env.PAIN_THEME, true),

  DARK_MODE:
    parseBoolean(process.env.DARK_MODE, true),

  STYLE: {
    NAME: "PAIN",
    TONE: "dark",
    PERSONALITY: "superior",
    PROVOCATIVE: true,
    MYSTERIOUS: true,
    FEARFUL: true,
    ELEGANT: true,

    COLORS: {
      PRIMARY: "RED",
      SECONDARY: "BLACK",
      TEXT: "WHITE"
    },

    SIGNATURE:
      "⏤͟͟͞𝐓𝐇𝐄 ➪ 𝐏𝐀𝐈𝐍 ᭄",

    FOOTER:
      "🩸 𝐓𝐇𝐄 𝐏𝐀𝐈𝐍 𝐌𝐃 🩸"
  },

  // ==========================================
  // AUTOMATIC FEATURES
  // ==========================================

  AUTO_READ:
    parseBoolean(process.env.AUTO_READ),

  AUTO_TYPING:
    parseBoolean(process.env.AUTO_TYPING),

  AUTO_RECORDING:
    parseBoolean(process.env.AUTO_RECORDING),

  AUTO_STATUS_VIEW:
    parseBoolean(process.env.AUTO_STATUS_VIEW),

  // ==========================================
  // FRONTEND
  // ==========================================

  FRONTEND_URL:
    process.env.FRONTEND_URL ||
    "https://the-pain-md.vercel.app",

  FRONTEND_URLS:
    parseList(process.env.FRONTEND_URLS)
      .map(url => url.replace(/\/$/, "")),

  // ==========================================
  // DATABASE
  // ==========================================

  DATABASE_URL:
    process.env.DATABASE_URL || "",

  DATABASE_SSL:
    parseBoolean(process.env.DATABASE_SSL, true),

  SESSION_ENCRYPTION_KEY:
    process.env.SESSION_ENCRYPTION_KEY || "",

  // ==========================================
  // SESSION COOKIES
  // ==========================================

  COOKIE_SECURE:
    parseBoolean(process.env.COOKIE_SECURE, true),

  COOKIE_NAME:
    process.env.COOKIE_NAME || "pain_session",

  // ==========================================
  // AI API KEYS
  // ==========================================

  OPENROUTER_API_KEY:
    process.env.OPENROUTER_API_KEY || "",

  HUGGINGFACE_API_KEY:
    process.env.HUGGINGFACE_API_KEY || "",

  GEMINI_API_KEY:
    process.env.GEMINI_API_KEY || "",

  OPENAI_API_KEY:
    process.env.OPENAI_API_KEY || "",

  CLAUDE_API_KEY:
    process.env.CLAUDE_API_KEY || "",

  // ==========================================
  // IMAGES
  // ==========================================

  MENU_IMAGE:
    process.env.MENU_IMAGE ||
    "https://files.catbox.moe/10v9f5.jpg",

  SUPPORT_IMAGE:
    process.env.SUPPORT_IMAGE ||
    "https://files.catbox.moe/dr55vz.png",

  BOTINFO_IMAGE:
    process.env.BOTINFO_IMAGE ||
    "https://files.catbox.moe/r3s1u6.png",

  OWNER_IMAGE:
    process.env.OWNER_IMAGE ||
    "https://files.catbox.moe/kf8r3t.png",

  CONNECT_IMAGE:
    process.env.CONNECT_IMAGE ||
    "https://files.catbox.moe/v72ssh.png",

  // ==========================================
  // AUDIO
  // ==========================================

  MENU_AUDIO:
    process.env.MENU_AUDIO ||
    "https://files.catbox.moe/e4zfh9.mp3",

  CONNECT_AUDIO:
    process.env.CONNECT_AUDIO ||
    "https://files.catbox.moe/239szf.mp3"
};

export default config;
