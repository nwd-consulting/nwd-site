-- Posts keep two copies of their content. The working copy (title, body_md) is what
-- Save draft writes. The published copy (pub_*) is what the website shows, and only
-- Publish writes it, so editing a live post changes nothing public until Publish.
CREATE TABLE posts (
  id            TEXT PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  body_md       TEXT NOT NULL,
  author        TEXT NOT NULL,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  pub_title     TEXT,
  pub_body_md   TEXT,
  published_at  TEXT          -- NULL means not on the website
);

CREATE TABLE sessions (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  expires_at  TEXT NOT NULL
);
