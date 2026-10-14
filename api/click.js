import { appendRow } from "./_sheets.js";

export default async function handler(req, res) {
  const id = String(req.query?.id || "").slice(0, 160);
  const campaign = String(req.query?.campaign || "").slice(0, 80);
  const destination = String(req.query?.to || "https://vasishtachary.com/");
  let target;
  try { target = new URL(destination); } catch { target = new URL("https://vasishtachary.com/"); }
  if (!["https:", "http:"].includes(target.protocol)) target = new URL("https://vasishtachary.com/");
  if (id && process.env.CRM_SHEET_ID) {
    try { await appendRow(process.env.CRM_EVENTS_TAB || "Email Events", [new Date().toISOString(), "click", id, campaign, target.toString(), req.headers["user-agent"] || ""]); }
    catch (error) { console.error(error); }
  }
  res.redirect(302, target.toString());
}
