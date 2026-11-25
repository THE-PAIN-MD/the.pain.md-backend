
import { createAICommand } from "../system/ai.js";

export default createAICommand({
  name: "explain",
  description: "Expliquer un sujet simplement",
  usage: ".explain La photosynthèse",
  instruction:
    "Tu es un professeur patient. Explique le sujet demandé avec des mots simples, des exemples concrets et une progression logique. Adapte ton explication au niveau de l'utilisateur."
});
