// Small quadratic client for the agent workflow. Node 20+, no dependencies.
//
//   node quadratic.mjs pick <repo-label>          claim the oldest queued ticket for this repo;
//                                                 prints its identifier, or nothing
//   node quadratic.mjs ticket <ID> <file>         write the ticket as Markdown to <file>
//   node quadratic.mjs title <ID>                 print the title
//   node quadratic.mjs attach <ID> <url> <title>  attach a link
//   node quadratic.mjs comment <ID> <body>
//   node quadratic.mjs label <ID> <from> <to>     swap one label for another
//   node quadratic.mjs state <ID> <state name>
//   node quadratic.mjs advance <repo-label> <to-label> <state> <comment> <ID>...
//                                                 for each ticket carrying <repo-label>: replace
//                                                 its agent:* label with <to-label>, set <state>,
//                                                 and comment; other tickets are skipped
//
// Env: QUADRATIC_URL, QUADRATIC_TOKEN.

import { writeFileSync } from 'node:fs';

const base = process.env.QUADRATIC_URL;
const headers = {
  authorization: `Bearer ${process.env.QUADRATIC_TOKEN}`,
  'content-type': 'application/json',
  'x-via': 'nwd-agent-workflow',
};

async function q(path, init = {}) {
  const res = await fetch(base + path, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${init.method || 'GET'} ${path}: ${res.status} ${data.message || ''}`);
  return data;
}

const names = (issue) => (issue.labels || []).map((l) => l.name || l);

async function swap(id, from, to) {
  const issue = await q(`/api/issues/${id}`);
  const labels = names(issue).filter((n) => n !== from && n !== to).concat(to ? [to] : []);
  await q(`/api/issues/${id}`, { method: 'PATCH', body: JSON.stringify({ labels }) });
}

const [cmd, ...args] = process.argv.slice(2);

if (cmd === 'pick') {
  const { issues } = await q('/api/issues?label=agent%3Aqueued&limit=100');
  const mine = issues.filter((i) => names(i).includes(args[0]))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  if (mine.length) {
    await swap(mine[0].identifier, 'agent:queued', 'agent:working');
    await q(`/api/issues/${mine[0].identifier}`, { method: 'PATCH', body: JSON.stringify({ state: 'In Progress' }) });
    process.stdout.write(mine[0].identifier);
  }
} else if (cmd === 'ticket') {
  const i = await q(`/api/issues/${args[0]}`);
  writeFileSync(args[1], `# ${i.identifier}: ${i.title}\n\n${i.description || ''}\n`);
} else if (cmd === 'title') {
  process.stdout.write((await q(`/api/issues/${args[0]}`)).title);
} else if (cmd === 'attach') {
  await q(`/api/issues/${args[0]}/attachments`, { method: 'POST', body: JSON.stringify({ url: args[1], title: args[2] }) });
} else if (cmd === 'comment') {
  await q(`/api/issues/${args[0]}/comments`, { method: 'POST', body: JSON.stringify({ body: args[1] }) });
} else if (cmd === 'state') {
  await q(`/api/issues/${args[0]}`, { method: 'PATCH', body: JSON.stringify({ state: args[1] }) });
} else if (cmd === 'advance') {
  // After the PR merges (to-label agent:merged) and after the deploy (agent:live). Without
  // this a ticket stayed on agent:pr-open, shown to the requester as "Preview ready", after its
  // change was merged and live (PROD-139, PROD-28).
  const [repo, to, state, body, ...ids] = args;
  for (const id of new Set(ids)) {
    let issue;
    try { issue = await q(`/api/issues/${id}`); } catch { continue; } // an ID from another tracker
    const labels = names(issue);
    if (!labels.includes(repo) || labels.includes(to)) continue;
    const next = labels.filter((n) => !n.startsWith('agent:')).concat([to]);
    await q(`/api/issues/${id}`, { method: 'PATCH', body: JSON.stringify({ labels: next, state }) });
    await q(`/api/issues/${id}/comments`, { method: 'POST', body: JSON.stringify({ body }) });
    console.log(`${id} -> ${to}, ${state}`);
  }
} else if (cmd === 'label') {
  await swap(args[0], args[1], args[2]);
} else {
  console.error('usage: see the header of this file');
  process.exit(2);
}
