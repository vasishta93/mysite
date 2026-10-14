import { appendRow } from "./_sheets.js";

const pixel = Buffer.from("R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=", "base64");

export default async function handler(req, res) {
  const id = String(req.query?.id || "").slice(0, 160);
  const campaign = String(req.query?.campaign || "").slice(0, 80);
  if (id && process.env.CRM_SHEET_ID) {
    try { await appendRow(process.env.CRM_EVENTS_TAB || "Email Events", [new Date().toISOString(), "open", id, campaign, req.headers["user-agent"] || "", req.headers["x-forwarded-for"] || ""]); }
    catch (error) { console.error(error); }
  }
  res.setHeader("Content-Type", "image/gif"); res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate"); res.status(200).send(pixel);
}
