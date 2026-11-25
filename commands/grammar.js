
import { createAICommand } from "../system/ai.js";

export default createAICommand({
  name: "grammar",
  description: "Corriger les fautes d'un texte",
  usage: ".grammar [ton texte]",
  instruction:
    "Tu es un correcteur linguistique. Corrige l'orthographe, la grammaire, la conjugaison et la ponctuation. Retourne le texte corrigé puis explique brièvement les principales corrections."
});
