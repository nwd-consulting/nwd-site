// Permanent redirects for URLs the site no longer serves. Checked in order; the first
// matching pattern wins.

const REDIRECTS = [
  // WordPress archive and feed URLs were never exported, but exported pages still
  // link to them (categories, tags, author pages, RSS).
  [/^\/(category|tag|author)\//, '/blog/'],
  [/(^|\/)feed\/?$/, '/blog/'],
  // The Services overview page was retired 2026-10-02; each service has its own page,
  // linked from the homepage's Services section.
  [/^\/services(\/|\/index\.html)?$/, '/#services'],
  // Profile pages of people no longer on the team (PROD-145).
  [/^\/travis-wichert(\/|\/index\.html)?$/, '/about/'],
];

export function legacyRedirect(url) {
  for (const [pattern, target] of REDIRECTS) {
    if (pattern.test(url.pathname)) return Response.redirect(new URL(target, url).toString(), 301);
  }
  return null;
}
