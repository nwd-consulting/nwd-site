// The nwd-site Worker. Routes below are handled here; every other path is a static
// file from public/, served by the ASSETS binding.
//
//   /                      homepage, with published posts added to its Posts list
//   /blog/                 every published post
//   /blog/<slug>/          one post (?preview shows the saved draft to editors)
//   /admin                 the blog editor (allowlisted Google accounts only)
//   /auth/google[/callback], /auth/logout, /auth/dev (local only)
//   /api/admin/posts[...]  editor API, see api.js
//
// Publishing never touches git: posts live in D1 and are rendered on request.

import ADMIN_HTML from './admin.html';
import { adminApi } from './api.js';
import { authCallback, authStart, currentUser, devLogin, logout } from './auth.js';
import { blogIndex, blogPost, homepage } from './blog.js';
import { json, redirect } from './http.js';
import { legacyRedirect } from './redirects.js';

async function route(request, env) {
  const url = new URL(request.url);
  const p = url.pathname;

  if (p === '/auth/google') return authStart(url, env);
  if (p === '/auth/google/callback') return authCallback(request, url, env);
  if (p === '/auth/dev') return (await devLogin(url, env)) || env.ASSETS.fetch(request);
  if (p === '/auth/logout') return logout(request, env);

  if (p.startsWith('/api/admin/posts')) {
    const email = await currentUser(request, env);
    if (!email) return json({ error: 'signed out' }, 401);
    // Writes come only from the editor page, which is same-origin.
    const origin = request.headers.get('origin');
    if (request.method !== 'GET' && origin && origin !== url.origin) return json({ error: 'bad origin' }, 403);
    return adminApi(request, url, env, email);
  }
  if (p === '/admin' || p === '/admin/') {
    if (!(await currentUser(request, env))) return redirect(url, '/auth/google');
    return new Response(ADMIN_HTML, {
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'private, no-store' },
    });
  }

  if (p === '/blog') return redirect(url, '/blog/', 301);
  if (p === '/blog/') return blogIndex(request, env);
  const post = /^\/blog\/([a-z0-9-]+)\/?$/.exec(p);
  if (post) {
    if (!p.endsWith('/')) return redirect(url, `/blog/${post[1]}/${url.search}`, 301);
    const res = await blogPost(request, url, env, post[1]);
    if (res) return res;
  }

  const moved = legacyRedirect(url);
  if (moved) return moved;

  if (p === '/' || p === '/index.html') return homepage(request, env);
  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env) {
    try {
      return await route(request, env);
    } catch (e) {
      console.error(e && e.stack ? e.stack : e);
      return new Response('Something went wrong.', { status: 500 });
    }
  },
};
