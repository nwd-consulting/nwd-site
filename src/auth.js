// Google sign-in and sessions for the blog editor.
//
// Access is controlled by ALLOWED_EMAILS alone. GOOGLE_HD only narrows Google's
// account chooser. Sessions live in D1 and are re-checked against the allowlist on
// every request, so removing an address locks that editor out immediately.

import { now, plainPage, randomId, readCookie } from './http.js';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const STATE_COOKIE = 'nwd_oauth';
const SESSION_COOKIE = 'nwd_session';
const SESSION_DAYS = 30;

function allowed(env, email) {
  return String(env.ALLOWED_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).includes(email);
}

export async function currentUser(request, env) {
  const id = readCookie(request, SESSION_COOKIE);
  if (!id) return null;
  const row = await env.DB.prepare('SELECT email, expires_at FROM sessions WHERE id = ?').bind(id).first();
  if (!row || row.expires_at <= now()) return null;
  return allowed(env, row.email) ? row.email : null;
}

async function startSession(env, email, secure) {
  const id = randomId(32);
  await env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(now()).run();
  await env.DB.prepare('INSERT INTO sessions (id, email, expires_at) VALUES (?,?,?)')
    .bind(id, email, new Date(Date.now() + SESSION_DAYS * 86400000).toISOString()).run();
  return `${SESSION_COOKIE}=${id}; Path=/; HttpOnly;${secure ? ' Secure;' : ''} SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`;
}

const redirectUri = (url) => new URL('/auth/google/callback', url.origin).toString();

export function authStart(url, env) {
  if (!env.GOOGLE_CLIENT_ID) return plainPage(500, 'Sign-in is not configured', 'GOOGLE_CLIENT_ID is missing.');
  const state = randomId();
  const g = new URL(GOOGLE_AUTH_URL);
  g.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  g.searchParams.set('redirect_uri', redirectUri(url));
  g.searchParams.set('response_type', 'code');
  g.searchParams.set('scope', 'openid email');
  g.searchParams.set('state', state);
  g.searchParams.set('prompt', 'select_account');
  if (env.GOOGLE_HD) g.searchParams.set('hd', env.GOOGLE_HD);
  return new Response(null, {
    status: 302,
    headers: {
      location: g.toString(),
      'set-cookie': `${STATE_COOKIE}=${state}; Path=/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}

export async function authCallback(request, url, env) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return plainPage(500, 'Sign-in is not configured', 'GOOGLE_CLIENT_SECRET is not set on this Worker.');
  }
  if (url.searchParams.get('error')) return plainPage(400, 'Sign-in cancelled', 'Google did not complete the sign-in.');
  const state = url.searchParams.get('state');
  if (!state || state !== readCookie(request, STATE_COOKIE)) {
    return plainPage(400, 'Sign-in expired', 'That sign-in link expired. Try again.');
  }
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: url.searchParams.get('code') || '',
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri(url),
      grant_type: 'authorization_code',
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.id_token) {
    console.error('token exchange failed', res.status, data.error);
    return plainPage(502, 'Sign-in failed', 'Google would not complete the sign-in. Try again.');
  }
  // The id_token came straight from Google's token endpoint over TLS, in exchange for
  // the client secret, so OIDC Core 3.1.3.7 allows skipping the signature check. The
  // claims are still checked.
  const claims = JSON.parse(atob(data.id_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!GOOGLE_ISSUERS.includes(claims.iss) || !aud.includes(env.GOOGLE_CLIENT_ID) ||
      claims.exp * 1000 <= Date.now() || claims.email_verified !== true) {
    return plainPage(400, 'Sign-in failed', 'That Google sign-in could not be verified.');
  }
  const email = String(claims.email).toLowerCase();
  if (!allowed(env, email)) {
    return plainPage(403, 'Not allowed', `${email} cannot edit the blog. Ask a site administrator to add it.`);
  }
  return new Response(null, {
    status: 302,
    headers: [
      ['location', '/admin'],
      ['set-cookie', await startSession(env, email, true)],
      ['set-cookie', `${STATE_COOKIE}=; Path=/auth; Max-Age=0`],
    ],
  });
}

// Local development only: `wrangler dev` with DEV_LOGIN=1 in .dev.vars, on localhost.
export async function devLogin(url, env) {
  if (env.DEV_LOGIN !== '1' || !['localhost', '127.0.0.1'].includes(url.hostname)) return null;
  const email = (url.searchParams.get('email') || '').toLowerCase();
  if (!allowed(env, email)) return plainPage(403, 'Not allowed', `${email} is not on the allowlist.`);
  return new Response(null, { status: 302, headers: { location: '/admin', 'set-cookie': await startSession(env, email, false) } });
}

export async function logout(request, env) {
  const id = readCookie(request, SESSION_COOKIE);
  if (id) await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(id).run();
  return new Response(null, {
    status: 302,
    headers: { location: '/', 'set-cookie': `${SESSION_COOKIE}=; Path=/; Max-Age=0` },
  });
}
