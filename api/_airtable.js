const base = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}`;

async function atFetch(path, init = {}) {
  const res = await fetch(`${base}/${encodeURIComponent(path)}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${process.env.AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {})
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${res.status}: ${text}`);
  }
  return res.json();
}

export async function createRecord(table, fields) {
  const data = await atFetch(table, {
    method: "POST",
    body: JSON.stringify({ records: [{ fields }] })
  });
  return data.records[0];
}

export async function getRecord(table, id) {
  return atFetch(`${table}/${id}`);
}

export async function updateRecord(table, id, fields) {
  const data = await atFetch(table, {
    method: "PATCH",
    body: JSON.stringify({ records: [{ id, fields }] })
  });
  return data.records[0];
}