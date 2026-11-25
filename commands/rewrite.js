
import { createAICommand } from "../system/ai.js";

export default createAICommand({
  name: "rewrite",
  description: "Reformuler un texte",
  usage: ".rewrite [ton texte]",
  instruction:
    "Tu es un assistant de rédaction. Reformule le texte de l'utilisateur pour le rendre plus clair, naturel et fluide, sans modifier son sens. Conserve la langue d'origine."
});
