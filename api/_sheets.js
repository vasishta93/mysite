import crypto from "node:crypto";

function b64(value) { return Buffer.from(value).toString("base64url"); }

async function accessToken() {
  const service = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}");
  if (!service.client_email || !service.private_key) throw new Error("Google Sheets credentials are not configured");
  const now = Math.floor(Date.now() / 1000);
  const header = b64(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64(JSON.stringify({ iss: service.client_email, scope: "https://www.googleapis.com/auth/spreadsheets", aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now }));
  const signer = crypto.createSign("RSA-SHA256"); signer.update(`${header}.${claim}`);
  const assertion = `${header}.${claim}.${signer.sign(service.private_key, "base64url")}`;
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }) });
  if (!response.ok) throw new Error(`Google token request failed: ${response.status}`);
  return (await response.json()).access_token;
}

export async function appendRow(tab, values) {
  const token = await accessToken();
  const id = process.env.CRM_SHEET_ID;
  if (!id) throw new Error("CRM_SHEET_ID is not configured");
  const range = encodeURIComponent(`${tab}!A:Z`);
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ values: [values] }) });
  if (!response.ok) throw new Error(`Google Sheets append failed: ${response.status}`);
  return response.json();
}
