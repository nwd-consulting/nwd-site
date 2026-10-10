// Small helpers shared by every route.

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export const redirect = (url, path, status = 302) => Response.redirect(new URL(path, url).toString(), status);

export const now = () => new Date().toISOString();

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const longDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Chicago' });

export function randomId(bytes = 24) {
  const b = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function readCookie(request, name) {
  const m = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`).exec(request.headers.get('cookie') || '');
  return m ? m[1] : null;
}

// A bare page for auth errors, outside the site's chrome.
export function plainPage(status, heading, sentence) {
  const body = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(heading)}</title><body style="font:17px/1.5 Georgia,serif;max-width:32rem;margin:15vh auto;padding:0 16px">
<h1 style="font-weight:500">${esc(heading)}</h1><p>${esc(sentence)}</p><p><a href="/admin">Back to the blog editor</a></p>`;
  return new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
}
