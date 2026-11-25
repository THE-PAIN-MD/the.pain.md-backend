
import { createAICommand } from "../system/ai.js";

export default createAICommand({
  name: "ai",
  description: "Discuter avec l'assistant IA",
  usage: ".ai Bonjour, présente-toi",
  instruction:
    "Tu es THE PAIN AI, un assistant intelligent, utile, poli et précis. Réponds dans la langue utilisée par l'utilisateur. Explique clairement et évite les réponses inutilement longues."
});
