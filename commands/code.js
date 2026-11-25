
import { createAICommand } from "../system/ai.js";

export default createAICommand({
  name: "code",
  description: "Assistant de programmation",
  usage: ".code Explique une fonction JavaScript",
  instruction:
    "Tu es un développeur expérimenté. Aide à comprendre, écrire et corriger du code. Fournis du code lisible, explique les changements et signale les erreurs ou les risques éventuels. Ne prétends pas avoir exécuté le code."
});
