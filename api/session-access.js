import { neon } from '@neondatabase/serverless';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SESSIONS = new Set(['problem-discovery-session']);

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, message: 'Method not allowed.' });
  }

  response.setHeader('Cache-Control', 'no-store');

  const email = String(request.body?.email || '').trim().toLowerCase();
  const name = String(request.body?.name || '').trim().replace(/\s+/g, ' ');
  const sessionSlug = String(request.body?.session || '').trim();
  const website = String(request.body?.website || '').trim();

  if (website) return response.status(200).json({ ok: true });
  if (name.length < 2 || name.length > 100) {
    return response.status(400).json({ ok: false, message: 'Enter your name.' });
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return response.status(400).json({ ok: false, message: 'Enter a valid email address.' });
  }
  if (!ALLOWED_SESSIONS.has(sessionSlug)) {
    return response.status(400).json({ ok: false, message: 'This session is not available.' });
  }
  if (!process.env.DATABASE_URL) {
    return response.status(503).json({ ok: false, message: 'Access is temporarily unavailable.' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql.transaction([
      sql`INSERT INTO session_leads (email, name, last_seen_at, access_count)
          VALUES (${email}, ${name}, NOW(), 1)
          ON CONFLICT (email) DO UPDATE
          SET name = EXCLUDED.name, last_seen_at = NOW(), access_count = session_leads.access_count + 1`,
      sql`INSERT INTO session_access_events (email, session_slug)
          VALUES (${email}, ${sessionSlug})`
    ]);

    response.setHeader(
      'Set-Cookie',
      `session_library=unlocked; Path=/; Max-Age=31536000; SameSite=Lax; Secure`
    );
    return response.status(200).json({ ok: true, destination: `/${sessionSlug}` });
  } catch (error) {
    console.error('Session access capture failed');
    return response.status(500).json({ ok: false, message: 'Could not save your access. Please try again.' });
  }
}
