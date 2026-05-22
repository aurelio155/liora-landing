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

    // Get Claude API key from environment variable
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "API key not configured" }),
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

    // Call Claude API
    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          max_tokens: 300,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Claude API error:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Failed to get response from Claude API" }),
      };
    }

    const data = await response.json();

    // Extract the response from Claude
    let reply = "";
    if (data.content && data.content.length > 0) {
      reply = data.content[0].text;
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
      headers,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
