// Blog pages rendered from D1, plus the homepage's Posts list.
//
// New pages borrow the chrome (header, footer, fonts, styles) of an existing static
// post page and swap in their own title and body with HTMLRewriter. The template's
// asset links are relative, hence the injected <base>.

import { marked } from 'marked';
import { currentUser } from './auth.js';
import { esc, longDate, redirect } from './http.js';

const TEMPLATE = '/2026/07/22/jake-mirra-ph-d/';

// Posts from before the D1 blog, which are static pages under public/. Listed on
// /blog/ beneath the D1 posts so the index is complete.
const STATIC_POSTS = [
  ['Jake Mirra, Ph.D.', '/2026/07/22/jake-mirra-ph-d/', '2026-07-22'],
  ['Kari Beth Krieger, Ph.D.', '/2026/06/02/kari-beth-krieger-m-nextlevelbiology/', '2026-06-02'],
  ['One Patent Confirmed and Another Patent Pending at NWD!', '/2026/05/19/one-patent-confirmed-and-another-patent-pending-at-nwd/', '2026-05-19'],
  ['When your training just isn’t enough…', '/2026/03/12/when-your-training-just-isnt-enough/', '2026-03-12'],
];

// Markdown comes only from allowlisted editors, so raw HTML in it is passed through.
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
    // The template's own metadata describes the template post, not this page.
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

export async function blogIndex(request, env) {
  const { results } = await env.DB
    .prepare('SELECT slug, pub_title, published_at FROM posts WHERE published_at IS NOT NULL ORDER BY published_at DESC').all();
  const item = (title, href, iso) =>
    `<li style="margin:0 0 1.2em"><a href="${href}" style="font-size:1.25em">${esc(title)}</a><br><small>${longDate(iso)}</small></li>`;
  const items = results.map((r) => item(r.pub_title, `/blog/${r.slug}/`, r.published_at))
    .concat(STATIC_POSTS.map(([t, h, d]) => item(t, h, `${d}T12:00:00Z`)));
  return renderInTemplate(request, env, {
    title: 'Blog',
    dateLine: '',
    bodyHtml: `<ul style="list-style:none;padding:0">${items.join('')}</ul>`,
    description: 'Posts from NWD Consulting Network.',
  });
}

// One post, or null if there is no such published post. ?preview shows the saved
// working copy to signed-in editors.
export async function blogPost(request, url, env, slug) {
  const row = await env.DB.prepare('SELECT * FROM posts WHERE slug = ?').bind(slug).first();
  if (!row) return null;
  if (url.searchParams.has('preview')) {
    if (!(await currentUser(request, env))) return redirect(url, '/auth/google');
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

// The static homepage, with the four newest D1 posts prepended to its Posts list in
// the list's own markup.
export async function homepage(request, env) {
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
