exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

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

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "API key not configured" }),
      };
    }

    const systemPrompt = "Tu es un assistant client pour Liora, une marque de bijoux haut de gamme. Liora propose des bijoux waterproof, hypoallergéniques, en acier inoxydable 316L + placage PVD. Les bijoux Liora sont conçus pour être portés 24/7. Gamme de prix: 15€ à 59€. Réponds avec enthousiasme et concision en français.";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4",
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("API error:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "API call failed" }),
      };
    }

    const data = await response.json();
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
