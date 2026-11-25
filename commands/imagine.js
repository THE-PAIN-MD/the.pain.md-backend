
import { createAICommand } from "../system/ai.js";

export default createAICommand({
  name: "imagine",
  description: "Créer un prompt détaillé pour une image",
  usage: ".imagine Pain dans une ville futuriste",
  instruction:
    "Tu es un directeur artistique spécialisé dans les prompts d'images. Transforme l'idée de l'utilisateur en un prompt détaillé et précis. Décris le sujet, la composition, l'éclairage, l'ambiance, les couleurs et le style visuel. Retourne uniquement le prompt final."
});
