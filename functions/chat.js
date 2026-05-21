

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

    // Get API key from environment variable
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "API key not configured" }),
      };
    }

    // Call Groq API (free, no payment needed)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "system",
            content: `Tu es un assistant client pour Liora, une marque de bijoux haut de gamme.

Liora propose des bijoux waterproof, hypoallergéniques, en acier inoxydable 316L + placage PVD.

Les bijoux Liora sont conçus pour être portés 24/7 — à la douche, à la plage, en vacances, en sport. Ils ne ternissent jamais et sont doux pour la peau la plus sensible.

Gamme de prix: 15€ à 59€.

Caractéristiques clés:
- Waterproof (acier 316L + PVD)
- Hypoallergénique
- Ne ternit jamais
- Minimaliste et intemporel
- Parfait pour les jeunes femmes 15-30 ans

Réponds aux questions des clients avec enthousiasme, professionalisme, et concision. Si la question est hors du scope Liora, suggère-lui de contacter liora.jewelry.fr@outlook.com.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("API error:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Failed to get response from API" }),
      };
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

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
