import type { IncomingMessage, ServerResponse } from "node:http";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const ERPNEXT_URL = process.env.ERPNEXT_URL || "https://key.solutions.bitvera.co";
  const ERPNEXT_API_KEY = process.env.ERPNEXT_API_KEY || "45ec974ff12c04b";
  const ERPNEXT_API_SECRET = process.env.ERPNEXT_API_SECRET || "4179a5d5fc9909d";

  let bodyStr = "";
  for await (const chunk of req) {
    bodyStr += chunk;
  }

  try {
    const erpRes = await fetch(`${ERPNEXT_URL}/api/resource/MediBook Appointment`, {
      method: "POST",
      headers: {
        Authorization: `token ${ERPNEXT_API_KEY}:${ERPNEXT_API_SECRET}`,
        "Content-Type": "application/json",
      },
      body: bodyStr,
    });

    const data = await erpRes.text();
    res.statusCode = erpRes.status;
    res.setHeader("Content-Type", "application/json");
    res.end(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: message }));
  }
}
