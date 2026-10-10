// The editor API behind /admin: list, create, save, publish, unpublish, delete.
//
//   GET    /api/admin/posts
//   POST   /api/admin/posts
//   PUT    /api/admin/posts/<id>
//   POST   /api/admin/posts/<id>/publish
//   POST   /api/admin/posts/<id>/unpublish
//   DELETE /api/admin/posts/<id>
//
// Each post has a working copy (title, body_md) and a published copy (pub_*); see
// migrations/0001_init.sql.

import { json, now, randomId } from './http.js';

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

function toClient(r) {
  return {
    id: r.id, slug: r.slug, title: r.title, body_md: r.body_md, author: r.author,
    created_at: r.created_at, updated_at: r.updated_at, published_at: r.published_at,
    // A live post whose saved working copy differs from what the site shows.
    unpublished_changes: !!r.published_at && (r.title !== r.pub_title || r.body_md !== r.pub_body_md),
  };
}

export async function adminApi(request, url, env, email) {
  const db = env.DB;
  const [, , , id, action] = url.pathname.split('/').filter(Boolean); // api admin posts [id] [action]
  const m = request.method;
  const fetchRow = (pid) => db.prepare('SELECT * FROM posts WHERE id = ?').bind(pid).first();

  if (!id && m === 'GET') {
    const { results } = await db.prepare('SELECT * FROM posts ORDER BY updated_at DESC').all();
    return json({ me: email, posts: results.map(toClient) });
  }
  if (!id && m === 'POST') {
    const body = await request.json().catch(() => ({}));
    const title = String(body.title || '').trim() || 'Untitled draft';
    const pid = randomId(12);
    const t = now();
    await db.prepare('INSERT INTO posts (id, slug, title, body_md, author, created_at, updated_at) VALUES (?,?,?,?,?,?,?)')
      .bind(pid, await uniqueSlug(db, slugify(title)), title, String(body.body_md || ''), email, t, t).run();
    return json(toClient(await fetchRow(pid)), 201);
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
  return json(toClient(await fetchRow(id)));
}
