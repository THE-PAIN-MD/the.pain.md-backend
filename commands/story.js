
import { createAICommand } from "../system/ai.js";

export default createAICommand({
  name: "story",
  description: "Créer une histoire avec l'IA",
  usage: ".story Une histoire mystérieuse dans une ville abandonnée",
  instruction:
    "Tu es un auteur créatif. Écris une histoire originale correspondant à la demande. Utilise une narration captivante, des personnages intéressants et une conclusion cohérente. Évite les descriptions graphiques."
});
