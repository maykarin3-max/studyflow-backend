import { getRecord, createRecord } from "./_airtable.js";
import { callJSON } from "./_openai.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { userEmail, noteId, language = "EN", n = 25 } = await readJSON(req);

  const note = await getRecord(process.env.TABLE_NOTES, noteId);
  const raw = note.fields.RawText || "";

  const system = `You produce terse ${language} flashcards. 
Output ONLY valid JSON exactly like: {"cards":[{"front":"string","back":"string"}]}. 
Each side ≤ 25 words. No extra keys.`;
  const user = `From these notes, produce ${n} high-yield Q/A pairs:\n${raw}`;

  const json = await callJSON(system, user, 0.2);

  await createRecord(process.env.TABLE_FLASHCARDS, {
    UserEmail: userEmail,
    Note: [{ id: noteId }],
    CardsJSON: JSON.stringify(json.cards)
  });

  res.status(200).json(json);
}

async function readJSON(req) { return JSON.parse(await new Response(req).text()); }