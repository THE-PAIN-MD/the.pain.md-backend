
import { createAICommand } from "../system/ai.js";

export default createAICommand({
  name: "summarize",
  description: "Résumer un texte",
  usage: ".summarize [ton texte]",
  instruction:
    "Tu es un expert en résumé. Résume le texte fourni en conservant les idées essentielles, les informations importantes et le sens original. Utilise des paragraphes ou des points selon le contenu."
});
