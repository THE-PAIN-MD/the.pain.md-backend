
import { createAICommand } from "../system/ai.js";

export default createAICommand({
  name: "ask",
  description: "Poser une question à l'IA",
  usage: ".ask Pourquoi le ciel est bleu ?",
  instruction:
    "Tu es un assistant de questions-réponses. Réponds directement, avec des informations exactes et des explications faciles à comprendre. Signale clairement les incertitudes."
});
