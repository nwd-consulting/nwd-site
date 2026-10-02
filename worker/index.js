// The NWD site Worker. Everything that is not listed here is a static file from the
// repo, served by the assets binding exactly as GitHub Pages served it.
//
//   /                      homepage, with published blog posts added to its Posts list
//   /blog/                 every published post
//   /blog/<slug>/          one post; ?preview shows the saved draft to signed-in editors
//   /admin                 the editor (signed-in, allowlisted users only)
//   /auth/google, /auth/google/callback, /auth/logout
//   /api/admin/posts[...]  editor API: list, create, save, publish, unpublish, delete
//
// Publishing never touches git: posts live in D1, and the blog pages are rendered
// from it on request, so a post is on the site the moment Publish returns.

import { marked } from 'marked';
import ADMIN_HTML from './admin.html';

// Blog pages borrow the chrome of an existing WordPress post page: header, footer,
// fonts and styles. Its asset links are relative, hence the <base> injected below.
const TEMPLATE = '/2026/07/22/jake-mirra-ph-d/';

// The WordPress-era posts, which are static pages in this repo. Listed on /blog/ under
// the new ones so the index is complete.
const LEGACY_POSTS = [
  ['Jake Mirra, Ph.D.', '/2026/07/22/jake-mirra-ph-d/', '2026-07-22'],
  ['Kari Beth Krieger, Ph.D.', '/2026/06/02/kari-beth-krieger-m-nextlevelbiology/', '2026-06-02'],
  ['One Patent Confirmed and Another Patent Pending at NWD!', '/2026/05/19/one-patent-confirmed-and-another-patent-pending-at-nwd/', '2026-05-19'],
  ['When your training just isn’t enough…', '/2026/03/12/when-your-training-just-isnt-enough/', '2026-03-12'],
];

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const STATE_COOKIE = 'nwd_oauth';
const SESSION_COOKIE = 'nwd_session';
const SESSION_DAYS = 30;

// ---------------------------------------------------------------- helpers

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

const now = () => new Date().toISOString();

const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const longDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Chicago' });

function randomId(bytes = 24) {
  const b = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function readCookie(request, name) {
  const m = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`).exec(request.headers.get('cookie') || '');
  return m ? m[1] : null;
}

function allowed(env, email) {
  return String(env.ALLOWED_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).includes(email);
}

function plainPage(status, heading, sentence) {
  const body = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(heading)}</title><body style="font:17px/1.5 Georgia,serif;max-width:32rem;margin:15vh auto;padding:0 16px">
<h1 style="font-weight:500">${esc(heading)}</h1><p>${esc(sentence)}</p><p><a href="/admin">Back to the blog editor</a></p>`;
  return new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

function slugify(title) {
  const s = title.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  return s || 'post';
}

async function uniqueSlug(db, base, exceptId) {
  for (let i = 1; ; i++) {
    const slug = i === 1 ? base : `${base}-${i}`;
    const row = await db.prepare('SELECT id FROM posts WHERE slug = ?').bind(slug).first();
    if (!row || row.id === exceptId) return slug;
  }
}

function adminPost(r) {
  return {
    id: r.id, slug: r.slug, title: r.title, body_md: r.body_md, author: r.author,
    created_at: r.created_at, updated_at: r.updated_at, published_at: r.published_at,
    // A live post whose saved working copy differs from what the site shows.
    unpublished_changes: !!r.published_at && (r.title !== r.pub_title || r.body_md !== r.pub_body_md),
  };
}

// ---------------------------------------------------------------- sessions

async function currentUser(request, env) {
  const id = readCookie(request, SESSION_COOKIE);
  if (!id) return null;
  const row = await env.DB.prepare('SELECT email, expires_at FROM sessions WHERE id = ?').bind(id).first();
  if (!row || row.expires_at <= now()) return null;
  // Taking someone off ALLOWED_EMAILS locks them out on their next request.
  return allowed(env, row.email) ? row.email : null;
}

async function startSession(env, email, secure) {
  const id = randomId(32);
  await env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(now()).run();
  await env.DB.prepare('INSERT INTO sessions (id, email, expires_at) VALUES (?,?,?)')
    .bind(id, email, new Date(Date.now() + SESSION_DAYS * 86400000).toISOString()).run();
  return `${SESSION_COOKIE}=${id}; Path=/; HttpOnly;${secure ? ' Secure;' : ''} SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`;
}

// ---------------------------------------------------------------- Google sign-in

const redirectUri = (url) => new URL('/auth/google/callback', url.origin).toString();

function authStart(url, env) {
  if (!env.GOOGLE_CLIENT_ID) return plainPage(500, 'Sign-in is not configured', 'GOOGLE_CLIENT_ID is missing.');
  const state = randomId();
  const g = new URL(GOOGLE_AUTH_URL);
  g.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  g.searchParams.set('redirect_uri', redirectUri(url));
  g.searchParams.set('response_type', 'code');
  g.searchParams.set('scope', 'openid email');
  g.searchParams.set('state', state);
  g.searchParams.set('prompt', 'select_account');
  // A hint for Google's account chooser, not a control. ALLOWED_EMAILS is the control.
  if (env.GOOGLE_HD) g.searchParams.set('hd', env.GOOGLE_HD);
  return new Response(null, {
    status: 302,
    headers: {
      location: g.toString(),
      'set-cookie': `${STATE_COOKIE}=${state}; Path=/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}

async function authCallback(request, url, env) {
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
  if (!allowed(env, email)) return plainPage(403, 'Not allowed', `${email} cannot edit the blog. Ask Jake to add it.`);
  return new Response(null, {
    status: 302,
    headers: [
      ['location', '/admin'],
      ['set-cookie', await startSession(env, email, true)],
      ['set-cookie', `${STATE_COOKIE}=; Path=/auth; Max-Age=0`],
    ],
  });
}

// Local testing only: `wrangler dev` with DEV_LOGIN=1 in .dev.vars, on localhost.
async function devLogin(url, env) {
  if (env.DEV_LOGIN !== '1' || !['localhost', '127.0.0.1'].includes(url.hostname)) return null;
  const email = (url.searchParams.get('email') || '').toLowerCase();
  if (!allowed(env, email)) return plainPage(403, 'Not allowed', `${email} is not on the allowlist.`);
  return new Response(null, { status: 302, headers: { location: '/admin', 'set-cookie': await startSession(env, email, false) } });
}

// ---------------------------------------------------------------- editor API

async function adminApi(request, url, env, email) {
  const db = env.DB;
  const [, , , id, action] = url.pathname.split('/').filter(Boolean); // api admin posts [id] [action]
  const m = request.method;
  const fetchRow = (pid) => db.prepare('SELECT * FROM posts WHERE id = ?').bind(pid).first();

  if (!id && m === 'GET') {
    const { results } = await db.prepare('SELECT * FROM posts ORDER BY updated_at DESC').all();
    return json({ me: email, posts: results.map(adminPost) });
  }
  if (!id && m === 'POST') {
    const body = await request.json().catch(() => ({}));
    const title = String(body.title || '').trim() || 'Untitled draft';
    const pid = randomId(12);
    const t = now();
    await db.prepare('INSERT INTO posts (id, slug, title, body_md, author, created_at, updated_at) VALUES (?,?,?,?,?,?,?)')
      .bind(pid, await uniqueSlug(db, slugify(title)), title, String(body.body_md || ''), email, t, t).run();
    return json(adminPost(await fetchRow(pid)), 201);
  }

  const row = id && (await fetchRow(id));
  if (!row) return json({ error: 'not found' }, 404);

  if (!action && m === 'PUT') {
    const body = await request.json().catch(() => ({}));
    const title = String(body.title ?? row.title).trim() || 'Untitled draft';
    // The slug follows the title until first publish, then freezes so links keep working.
    const slug = row.published_at ? row.slug : await uniqueSlug(db, slugify(title), row.id);
    await db.prepare('UPDATE posts SET title = ?, body_md = ?, slug = ?, updated_at = ? WHERE id = ?')
      .bind(title, String(body.body_md ?? row.body_md), slug, now(), id).run();
  } else if (action === 'publish' && m === 'POST') {
    await db.prepare('UPDATE posts SET pub_title = title, pub_body_md = body_md, published_at = COALESCE(published_at, ?), updated_at = ? WHERE id = ?')
      .bind(now(), now(), id).run();
  } else if (action === 'unpublish' && m === 'POST') {
    await db.prepare('UPDATE posts SET pub_title = NULL, pub_body_md = NULL, published_at = NULL, updated_at = ? WHERE id = ?')
      .bind(now(), id).run();
  } else if (!action && m === 'DELETE') {
    if (row.published_at) return json({ error: 'Take this post off the website before deleting it.' }, 409);
    await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
    return json({ deleted: id });
  } else {
    return json({ error: 'no such route' }, 404);
  }
  return json(adminPost(await fetchRow(id)));
}

// ---------------------------------------------------------------- blog pages

// Markdown comes only from allowlisted editors, so raw HTML in it is passed through,
// the same trust WordPress gave an Administrator.
const md = (s) => marked.parse(s || '', { gfm: true, breaks: false });

class SetInner {
  constructor(html) { this.html = html; }
  element(el) { el.setInnerContent(this.html, { html: true }); }
}
const remove = { element: (el) => el.remove() };

async function renderInTemplate(request, env, { title, dateLine, bodyHtml, description, noindex }) {
  const res = await env.ASSETS.fetch(new Request(new URL(TEMPLATE, request.url)));
  const rewriter = new HTMLRewriter()
    .on('head', {
      element(el) {
        el.prepend(`<base href="${TEMPLATE}">`, { html: true });
        el.append(`<meta name="description" content="${esc(description)}">` +
          (noindex ? '<meta name="robots" content="noindex">' : ''), { html: true });
      },
    })
    .on('title', new SetInner(`${esc(title)} &#8211; NWD Consulting Network`))
    // The template's metadata describes Jake's post, not this page.
    .on('meta[property^="og:"], meta[name^="twitter:"], meta[name="description"], link[rel="canonical"], link[rel="shortlink"], link[rel="alternate"], script[type="application/ld+json"]', remove)
    .on('h1.wp-block-post-title', new SetInner(esc(title)))
    .on('.wp-block-post-date', new SetInner(dateLine))
    .on('.wp-block-post-content', new SetInner(bodyHtml))
    .on('.wp-block-post-featured-image, .wp-block-post-time-to-read, .wp-block-post-terms, .wp-block-post-navigation-link, .wp-block-comments', remove);
  return new Response(rewriter.transform(res).body, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': noindex ? 'private, no-store' : 'public, max-age=60' },
  });
}

async function blogIndex(request, env) {
  const { results } = await env.DB
    .prepare('SELECT slug, pub_title, published_at FROM posts WHERE published_at IS NOT NULL ORDER BY published_at DESC').all();
  const item = (title, href, iso) =>
    `<li style="margin:0 0 1.2em"><a href="${href}" style="font-size:1.25em">${esc(title)}</a><br><small>${longDate(iso)}</small></li>`;
  const items = results.map((r) => item(r.pub_title, `/blog/${r.slug}/`, r.published_at))
    .concat(LEGACY_POSTS.map(([t, h, d]) => item(t, h, `${d}T12:00:00Z`)));
  return renderInTemplate(request, env, {
    title: 'Blog',
    dateLine: '',
    bodyHtml: `<ul style="list-style:none;padding:0">${items.join('')}</ul>`,
    description: 'Posts from NWD Consulting Network.',
  });
}

async function blogPost(request, url, env, slug) {
  const row = await env.DB.prepare('SELECT * FROM posts WHERE slug = ?').bind(slug).first();
  if (!row) return null;
  if (url.searchParams.has('preview')) {
    // The saved working copy, for editors only: what Publish would put on the site.
    if (!(await currentUser(request, env))) return Response.redirect(new URL('/auth/google', url).toString(), 302);
    const banner = `<p style="background:#fbefdc;border:1px solid #e6c48a;padding:10px 14px;font:15px/1.4 sans-serif">
      Preview of the saved draft. ${row.published_at ? 'The live version is unchanged until you press Publish.' : 'This post is not on the website yet.'}
      <a href="/admin">Back to the editor</a></p>`;
    return renderInTemplate(request, env, {
      title: row.title, dateLine: row.published_at ? longDate(row.published_at) : 'Draft',
      bodyHtml: banner + md(row.body_md), description: row.title, noindex: true,
    });
  }
  if (!row.published_at) return null;
  const text = row.pub_body_md.replace(/[#*_>`\[\]()!-]/g, '').replace(/\s+/g, ' ').trim();
  return renderInTemplate(request, env, {
    title: row.pub_title, dateLine: longDate(row.published_at), bodyHtml: md(row.pub_body_md),
    description: text.length > 155 ? text.slice(0, 154) + '…' : text,
  });
}

// Published posts go at the top of the homepage's Posts list, in its own markup.
async function homepage(request, env) {
  const res = await env.ASSETS.fetch(request);
  if (!res.ok || !(res.headers.get('content-type') || '').includes('text/html')) return res;
  const { results } = await env.DB
    .prepare('SELECT slug, pub_title, published_at FROM posts WHERE published_at IS NOT NULL ORDER BY published_at DESC LIMIT 4').all();
  if (!results.length) return res;
  const items = results.map((r) => `<li class="wp-block-post post type-post status-publish">
<div class="wp-block-group is-vertical is-layout-flex wp-container-core-group-is-layout-fcb76b72 wp-block-group-is-layout-flex">
<h3 class="no-underline wp-block-post-title has-medium-font-size"><a href="/blog/${r.slug}/" target="_self">${esc(r.pub_title)}</a></h3>
<div class="wp-block-post-terms has-text-color has-secondary-color">${longDate(r.published_at)}</div>
</div></li>`).join('');
  let done = false;
  const out = new HTMLRewriter().on('ul.wp-block-post-template', {
    element(el) { if (!done) { el.prepend(items, { html: true }); done = true; } },
  }).transform(res);
  const headers = new Headers(out.headers);
  headers.set('cache-control', 'public, max-age=60');
  return new Response(out.body, { status: out.status, headers });
}

// ---------------------------------------------------------------- router

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;
    try {
      if (p === '/auth/google') return authStart(url, env);
      if (p === '/auth/google/callback') return authCallback(request, url, env);
      if (p === '/auth/dev') return (await devLogin(url, env)) || env.ASSETS.fetch(request);
      if (p === '/auth/logout') {
        const id = readCookie(request, SESSION_COOKIE);
        if (id) await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(id).run();
        return new Response(null, {
          status: 302,
          headers: { location: '/', 'set-cookie': `${SESSION_COOKIE}=; Path=/; Max-Age=0` },
        });
      }

      if (p.startsWith('/api/admin/posts')) {
        const email = await currentUser(request, env);
        if (!email) return json({ error: 'signed out' }, 401);
        // Writes come only from the editor page, which is same-origin.
        const origin = request.headers.get('origin');
        if (request.method !== 'GET' && origin && origin !== url.origin) return json({ error: 'bad origin' }, 403);
        return adminApi(request, url, env, email);
      }
      if (p === '/admin' || p === '/admin/') {
        if (!(await currentUser(request, env))) return Response.redirect(new URL('/auth/google', url).toString(), 302);
        return new Response(ADMIN_HTML, {
          headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'private, no-store' },
        });
      }

      if (p === '/blog') return Response.redirect(new URL('/blog/', url).toString(), 301);
      if (p === '/blog/') return blogIndex(request, env);
      const m = /^\/blog\/([a-z0-9-]+)\/?$/.exec(p);
      if (m) {
        if (!p.endsWith('/')) return Response.redirect(new URL(`/blog/${m[1]}/${url.search}`, url).toString(), 301);
        const r = await blogPost(request, url, env, m[1]);
        if (r) return r;
      }
      // The Services overview page is retired (2026-10-02): each service has its own
      // page, linked from its box in the homepage's Services section.
      if (p === '/services' || p === '/services/' || p === '/services/index.html') {
        return Response.redirect(new URL('/#services', url).toString(), 301);
      }
      if (p === '/' || p === '/index.html') return homepage(request, env);
      return env.ASSETS.fetch(request);
    } catch (e) {
      console.error(e && e.stack ? e.stack : e);
      return new Response('Something went wrong.', { status: 500 });
    }
  },
};
