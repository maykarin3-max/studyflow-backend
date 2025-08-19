import dayjs from "dayjs";
import { createRecord } from "./_airtable.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { userEmail, noteId, examDate, dailyMinutes = 90, prefs = {} } = await readJSON(req);

  const start = dayjs().add(1, "day");
  const end = dayjs(examDate);
  const days = [];
  let cur = start;

  while (cur.isBefore(end) || cur.isSame(end, "day")) {
    const read = Math.round(dailyMinutes * 0.3);
    const recall = Math.round(dailyMinutes * 0.3);
    const practice = Math.round(dailyMinutes * 0.35);
    const meditate = Math.max(5, Math.round(dailyMinutes * 0.05));
    days.push({
      date: cur.format("YYYY-MM-DD"),
      tasks: [
        { type: "read", minutes: read },
        { type: "active_recall", minutes: recall },
        { type: (prefs.modalities || []).includes("quiz") ? "quiz" : "flashcards", minutes: practice },
        { type: (prefs.modalities || []).includes("meditation") ? "meditation" : "review", minutes: meditate }
      ]
    });
    cur = cur.add(1, "day");
  }

  const rec = await createRecord(process.env.TABLE_PLANS, {
    UserEmail: userEmail,
    Note: [{ id: noteId }],
    ExamDate: examDate,
    DailyMinutes: dailyMinutes,
    Prefs: JSON.stringify(prefs),
    PlanJSON: JSON.stringify({ days })
  });

  res.status(200).json({ planId: rec.id, plan: { days } });
}

async function readJSON(req) { return JSON.parse(await new Response(req).text()); }