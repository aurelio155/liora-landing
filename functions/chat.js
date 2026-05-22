exports.handler = async (event) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Handle OPTIONS requests
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  // Only accept POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { message } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Message is required" }),
      };
    }

    // Get HF token from environment variable
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "HF token not configured" }),
      };
    }

    // System prompt for Liora IA
    const systemPrompt = `Tu es un assistant client pour Liora, une marque de bijoux haut de gamme.

Liora propose des bijoux waterproof, hypoallergéniques, en acier inoxydable 316L + placage PVD.

Les bijoux Liora sont conçus pour être portés 24/7 — à la douche, à la plage, en vacances, en sport. Ils ne ternissent jamais et sont doux pour la peau la plus sensible.

Gamme de prix: 15€ à 59€.

Caractéristiques clés:
- Waterproof (acier 316L + PVD)
- Hypoallergénique
- Ne ternit jamais
- Minimaliste et intemporel
- Parfait pour les jeunes femmes 15-30 ans

Réponds aux questions des clients avec enthousiasme, professionalisme, et concision en français.`;

    // Call Hugging Face Inference API
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `[INST] Système: ${systemPrompt}\n\nClient: ${message}\n\nAssistant: [/INST]`,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("HF API error:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Failed to get response from Hugging Face" }),
      };
    }

    const data = await response.json();

    // Extract the generated text
    let reply = "";
    if (Array.isArray(data) && data.length > 0) {
      reply = data[0].generated_text;
      // Clean up the response - remove the input part
      const parts = reply.split("[/INST]");
      if (parts.length > 1) {
        reply = parts[1].trim();
      }
    } else if (data.generated_text) {
      reply = data.generated_text;
    }

    if (!reply) {
      reply = "Désolé, je n'ai pas pu générer une réponse. Essaie à nouveau!";
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
