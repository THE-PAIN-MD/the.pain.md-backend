
export function createAICommand({
  name,
  description,
  instruction,
  usage
}) {
  return {
    name,
    category: "AI",
    description,

    async execute(sock, m, args) {
      const input = args.join(" ").trim();

      if (!input) {
        return m.reply(`❌ Utilisation : ${usage}`);
      }

      const apiKey = process.env.AI_API_KEY;
      const baseURL = process.env.AI_BASE_URL;
      const model = process.env.AI_MODEL;

      if (!apiKey || !baseURL || !model) {
        return m.reply(
          "❌ L'IA n'est pas encore configurée. " +
          "L'administrateur doit ajouter les paramètres API."
        );
      }

      try {
        const endpoint =
          `${baseURL.replace(/\/+$/, "")}/chat/completions`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content: instruction
              },
              {
                role: "user",
                content: input
              }
            ],
            temperature: 0.7
          })
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("AI API ERROR:", data);
          return m.reply(
            `❌ Service IA indisponible (erreur ${response.status}).`
          );
        }

        const answer =
          data.choices?.[0]?.message?.content?.trim();

        if (!answer) {
          return m.reply("❌ L'IA n'a retourné aucune réponse.");
        }

        const output = answer.length > 3500
          ? answer.slice(0, 3450) + "\n\n… Réponse raccourcie."
          : answer;

        await m.reply(
          `╭─❖ 🧠 𝐓𝐇𝐄 𝐏𝐀𝐈𝐍 𝐀𝐈 ❖─╮\n\n${output}\n\n╰─────────────❖`
        );

      } catch (error) {
        console.error("AI COMMAND ERROR:", error);
        await m.reply("❌ Impossible de contacter le service IA.");
      }
    }
  };
}
