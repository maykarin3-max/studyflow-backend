import { getRecord, createRecord } from "./_airtable.js";
import { callJSON } from "./_openai.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { userEmail, noteId, language = "EN", n = 10 } = await readJSON(req);

  const note = await getRecord(process.env.TABLE_NOTES, noteId);
  const raw = note.fields.RawText || "";

  const system = `You create quizzes in ${language}. 
Return ONLY: {"questions":[{"type":"mcq|true_false|short_answer","question":"string","choices":["a","b","c","d"]?,"answerIndex":0?,"answerText":"string"?, "explanation":"string"}]}. 
No extra keys. Ground everything ONLY in the provided notes.`;
  const user = `Make ${n} mixed questions strictly based on these notes:\n${raw}`;

  const json = await callJSON(system, user, 0.2);

  await createRecord(process.env.TABLE_QUIZZES, {
    UserEmail: userEmail,
    Note: [{ id: noteId }],
    QuizJSON: JSON.stringify(json.questions)
  });

  res.status(200).json(json);
}

async function readJSON(req) { return JSON.parse(await new Response(req).text()); }