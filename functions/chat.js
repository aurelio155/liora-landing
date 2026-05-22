exports.handler = async (event) => {
  const headers = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Content-Type": "application/json"};
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ reply: "Method not allowed" }) };

  try {
    const { message } = JSON.parse(event.body);
    if (!message) return { statusCode: 400, headers, body: JSON.stringify({ reply: "Message required" }) };

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return { statusCode: 200, headers, body: JSON.stringify({ reply: "Configuration error" }) };

    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          { role: "system", content: "Tu es un assistant expert Liora bijoux. Réponds en français, amical et professionnel. Liora = acier 316L + plaquage PVD, waterproof, hypoallergénique, 15€-59€. Jeunes femmes 15-30 ans. Sois concis (2-3 phrases), enthousiaste." },
          { role: "user", content: message }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    const data = await resp.json();

    if (!resp.ok) {
      const errorMsg = data.error?.message || "API error";
      return { statusCode: 200, headers, body: JSON.stringify({ reply: `Erreur: ${errorMsg}` }) };
    }

    const reply = data.choices?.[0]?.message?.content || "Désolée, je n'ai pas compris.";
    return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
  } catch (e) {
    return { statusCode: 200, headers, body: JSON.stringify({ reply: `Erreur technique: ${e.message}` }) };
  }
};
