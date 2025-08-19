import { createRecord } from "./_airtable.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { userEmail, noteTitle, rawText, language } = await readJSON(req);

  const rec = await createRecord(process.env.TABLE_NOTES, {
    UserEmail: userEmail,
    NoteTitle: noteTitle,
    RawText: rawText,
    Language: language || "EN"
  });

  res.status(200).json({ noteId: rec.id });
}

async function readJSON(req) {
  return JSON.parse(await new Response(req).text());
}