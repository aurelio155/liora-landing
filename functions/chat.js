exports.handler = async (event) => {
  const headers = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Content-Type": "application/json"};
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ reply: "Method not allowed" }) };

  try {
    const { message } = JSON.parse(event.body);
    if (!message) return { statusCode: 400, headers, body: JSON.stringify({ reply: "Message required" }) };

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { statusCode: 200, headers, body: JSON.stringify({ reply: "ERROR: No API key in Netlify" }) };

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-opus-4",
        max_tokens: 300,
        system: "Tu es assistant Liora bijoux.",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await resp.json();

    if (!resp.ok) {
      const errorMsg = data.error?.message || JSON.stringify(data);
      return { statusCode: 200, headers, body: JSON.stringify({ reply: `ERROR: ${errorMsg}` }) };
    }

    const reply = data.content?.[0]?.text || "No response";
    return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
  } catch (e) {
    return { statusCode: 200, headers, body: JSON.stringify({ reply: `ERROR: ${e.message}` }) };
  }
};
