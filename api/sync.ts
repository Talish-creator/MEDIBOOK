import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ERPNEXT_URL = process.env.ERPNEXT_URL || "https://key.solutions.bitvera.co";
  const ERPNEXT_API_KEY = process.env.ERPNEXT_API_KEY || "45ec974ff12c04b";
  const ERPNEXT_API_SECRET = process.env.ERPNEXT_API_SECRET || "4179a5d5fc9909d";

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const erpRes = await fetch(`${ERPNEXT_URL}/api/resource/MediBook Appointment`, {
      method: "POST",
      headers: {
        Authorization: `token ${ERPNEXT_API_KEY}:${ERPNEXT_API_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await erpRes.json();
    return res.status(erpRes.status).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
