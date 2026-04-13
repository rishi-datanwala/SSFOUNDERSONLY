/**
 * SmartSound — IP Session Limiter
 * Cloudflare Worker + KV
 * 
 * Deploy: wrangler deploy
 * KV namespace: SESSION_LIMIT
 * 
 * Endpoints:
 *   GET  /check  — check if this IP has a session available today
 *   POST /record — record that this IP used their free session today
 *   GET  /health — returns 200 OK
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function todayUTC() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Get real client IP (Cloudflare sets this header)
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    // Hash the IP before storing — never store raw IPs
    const ipHash = await hashIP(ip);
    const today = todayUTC();
    const kvKey = `session:${ipHash}:${today}`;

    // ── GET /check ─────────────────────────────────────────
    if (path === '/check' && request.method === 'GET') {
      const existing = await env.SESSION_LIMIT.get(kvKey);
      if (existing) {
        // Already used session today
        return json({
          allowed: false,
          reason: 'daily_limit',
          message: 'Free tier: 1 session per day. Come back tomorrow or upgrade to Focus+.',
          resetAt: tomorrowMidnightUTC(),
        });
      }
      return json({ allowed: true, message: 'Session available.' });
    }

    // ── POST /record ────────────────────────────────────────
    if (path === '/record' && request.method === 'POST') {
      // TTL: 26 hours (covers timezone edge cases)
      await env.SESSION_LIMIT.put(kvKey, '1', { expirationTtl: 60 * 60 * 26 });
      return json({ recorded: true, resetAt: tomorrowMidnightUTC() });
    }

    // ── GET /health ─────────────────────────────────────────
    if (path === '/health') {
      return json({ status: 'ok', time: new Date().toISOString() });
    }

    return json({ error: 'Not found' }, 404);
  }
};

// SHA-256 hash of IP — stored hash only, never raw IP (GDPR friendly)
async function hashIP(ip) {
  const data = new TextEncoder().encode(ip + 'smartsound_salt_2024');
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('').slice(0, 32); // 32 hex chars is plenty for a KV key
}

function tomorrowMidnightUTC() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}
