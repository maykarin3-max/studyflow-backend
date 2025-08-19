const BASE = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

export async function callJSON(system, user, temperature = 0.3) {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    })
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.choices[0].message.content;
  return JSON.parse(text);
}