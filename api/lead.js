import { appendRow } from "./_sheets.js";

function body(req) {
  if (req.body && typeof req.body === "object") return req.body;
  return Object.fromEntries(new URLSearchParams(req.body || ""));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const data = body(req);
  if (!data.name || !data.email || !data.message || data.consent !== "yes") return res.status(400).json({ error: "Name, email, message and consent are required" });
  try {
    await appendRow(process.env.CRM_LEADS_TAB || "Inbound Leads", [new Date().toISOString(), data.source || "website", data.name, data.email, data.company || "", data.website || "", data.message, "New", "", ""]);
    return res.redirect(303, `${data.source === "ai-automation" ? "/ai-automation/" : "/"}?submitted=1#contact`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Submission could not be saved" });
  }
}
