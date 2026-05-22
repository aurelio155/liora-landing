exports.handler = async (event) => {
  const headers = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Content-Type": "application/json"};
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  try {
    const { message } = JSON.parse(event.body);
    if (!message) return { statusCode: 400, headers, body: JSON.stringify({ error: "Message is required" }) };
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { statusCode: 500, headers, body: JSON.stringify({ error: "API key not configured" }) };
    const systemPrompt = "Tu es assistant client Liora bijoux haut de gamme. Waterproof, hypoallergénique, 15-59€. Réponds en français.";
    const resp = await fetch("https://api.anthropic.com/v1/messages", {method: "POST", headers: {"Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json", "anthropic-version": "2023-06-01"}, body: JSON.stringify({model: "claude-opus-4", max_tokens: 300, system: systemPrompt, messages: [{role: "user", content: message}]})});
    if (!resp.ok) return { statusCode: 500, headers, body: JSON.stringify({ error: "API failed" }) };
    const data = await resp.json();
    const reply = data.content?.[0]?.text || "Erreur. Essaie à nouveau!";
    return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Error" }) };
  }
};
