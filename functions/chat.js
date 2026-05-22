exports.handler = async (event) => {
  const headers = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Content-Type": "application/json"};
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ reply: "Method not allowed" }) };

  try {
    const { message } = JSON.parse(event.body);
    if (!message) return { statusCode: 400, headers, body: JSON.stringify({ reply: "Message required" }) };

    const msg = message.toLowerCase().trim();

    const responses = {
      matériau: ["Acier inoxydable 316L avec plaquage PVD — le meilleur matériau pour des bijoux durables et hypoallergéniques. Résiste à l'eau, aux chocs et à la corrosion! ✨", "On utilise l'acier 316L, le même que dans l'aéronautique. Avec le plaquage PVD, tes bijoux restent comme neufs pendant des années."],
      acier: ["Acier inoxydable 316L avec plaquage PVD. C'est le matériau premium pour des bijoux qu'on ne veut jamais enlever.", "Notre acier 316L est hypoallergénique, waterproof et ultra-résistant. Parfait pour un bijou de tous les jours!"],
      prix: ["Nos bijoux coûtent entre 15€ et 59€. Du luxe abordable pour des pièces qu'on porte tous les jours! 💎", "Entre 15€ et 59€ selon les pièces. Chaque bijou est une investment dans un classique intemporel."],
      water: ["Complètement waterproof! Tu peux garder tes bijoux Liora à la plage, sous la douche, même en piscine.", "100% waterproof grâce au plaquage PVD. Garde tes bijoux même à la plage ou sous la douche."],
      allergie: ["Nos bijoux sont hypoallergéniques. Même les peaux sensibles les adorent! Pas de réaction, pas de problème.", "Acier 316L = zéro allergies. Perfect pour tous les types de peau, même les plus sensibles."],
      commande: ["Tu peux commander directement sur notre site! Livraison rapide et sécurisée. Qu'est-ce qui te plaît?", "Commande sur le site et reçois ta pièce en quelques jours. Besoin d'aide pour choisir?"],
      livraison: ["On envoie rapidement! Les détails exacts sont à la commande. Ça arrive en quelques jours 📦", "Livraison rapide et discrète. Tu recevras les infos précises au moment de ta commande."],
      garantie: ["Tes bijoux Liora sont conçus pour durer. Avec le plaquage PVD et l'acier 316L, tu as des années devant toi.", "Garantie qualité: nos bijoux sont faits pour ne jamais enlever. Des matériaux premium pour ça!"],
      taille: ["On a des tailles pour tous les poignets! Le guide des tailles est sur le site. Besoin d'aide?", "Différentes tailles disponibles. Regarde le guide de tailles pour trouver ta taille parfaite."],
      couleur: ["Nos bijoux en acier 316L ont une belle teinte dorée/champagne grâce au plaquage PVD. Intemporelle et élégante!", "Le plaquage PVD donne une belle finition dorée/champagne qui s'accorde avec tout."],
      avis: ["Les filles adorent Liora! Des bijoux qu'on porte tous les jours et qu'on veut jamais enlever. Rejoins la communauté! 💫", "Des milliers de filles portent leurs bijoux Liora au quotidien. À toi de rejoindre la famille!"],
      design: ["Nos bijoux sont minimalistes mais intemporels. Des pièces délicates et élégantes qu'on porte pour la vie.", "Design épuré et intemporel. Pas de tendance qui va passer, juste des classiques qu'on aime pour toujours."],
      entretien: ["Simple! Un coup de chiffon de temps en temps suffit. Avec l'acier 316L et le plaquage PVD, tes bijoux restent comme neufs.", "Très facile à entretenir. Juste un chiffon doux occasionnellement. Tes bijoux resteront parfaits!"]
    };

    let reply = null;
    for (const [keyword, answers] of Object.entries(responses)) {
      if (msg.includes(keyword)) {
        reply = answers[Math.floor(Math.random() * answers.length)];
        break;
      }
    }

    if (!reply) {
      const fallbacks = ["Super question! Dis-moi plus — ça parle de quel aspect de Liora? (matériau, prix, commande, livraison...)", "Hmm, je suis pas sûre d'avoir compris! Tu demandes un truc sur nos bijoux en général, les prix, ou la commande?", "Je suis là pour t'aider sur Liora! Tu veux savoir quoi au juste? 💎"];
      reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
  } catch (e) {
    return { statusCode: 200, headers, body: JSON.stringify({ reply: "Oups, petit souci technique! Réessaie 💫" }) };
  }
};
