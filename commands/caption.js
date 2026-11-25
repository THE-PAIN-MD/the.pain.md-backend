
export default {
  name: "caption",
  category: "media",

  async execute(sock, m, args) {
    try {
      const prompt = args.join(" ").trim();

      if (!prompt) {
        return m.reply(
          "Utilisation : .caption décris ton image ou ton idée"
        );
      }

      const apiKey = process.env.AI_API_KEY;
      const baseURL = (
        process.env.AI_BASE_URL || "https://api.groq.com/openai/v1"
      ).replace(/\/+$/, "");

      const model = process.env.AI_MODEL || "llama-3.3-70b-versatile";

      if (!apiKey) {
        return m.reply("❌ AI_API_KEY n'est pas configurée.");
      }

      const response = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "Écris une légende courte, originale et adaptée aux réseaux sociaux. Réponds uniquement avec la légende."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 250
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Erreur du service IA.");
      }

      const caption = data.choices?.[0]?.message?.content?.trim();

      if (!caption) {
        throw new Error("Aucune légende générée.");
      }

      await m.reply(
        `📝 *𝐂𝐀𝐏𝐓𝐈𝐎𝐍*\n\n${caption}\n\n🩸 𝐓𝐇𝐄 𝐏𝐀𝐈𝐍 𝐌𝐃`
      );
    } catch (err) {
      await m.reply(`❌ ${err.message}`);
    }
  }
};
