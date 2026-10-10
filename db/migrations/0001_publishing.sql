-- Publishing portal. Additive only: nothing here drops or renames existing columns or tables.
ALTER TABLE portfolio_posts ADD COLUMN IF NOT EXISTS id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE portfolio_posts ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE portfolio_posts ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE portfolio_posts ADD COLUMN IF NOT EXISTS first_published_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS portfolio_posts_id_key ON portfolio_posts (id);

UPDATE portfolio_posts
SET first_published_at = (published->>'dateISO')::timestamptz
WHERE first_published_at IS NULL AND published IS NOT NULL AND published->>'dateISO' IS NOT NULL;

CREATE TABLE IF NOT EXISTS portfolio_post_revisions (
  id bigserial PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES portfolio_posts (id) ON DELETE CASCADE,
  version integer NOT NULL,
  draft jsonb NOT NULL,
  reason text NOT NULL CHECK (reason IN ('save', 'publish', 'checkpoint', 'restore', 'unpublish')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS portfolio_post_revisions_post_idx ON portfolio_post_revisions (post_id, id DESC);

CREATE TABLE IF NOT EXISTS portfolio_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text UNIQUE NOT NULL,
  pathname text,
  content_type text,
  bytes integer,
  width integer,
  height integer,
  alt text NOT NULL DEFAULT '',
  lqip text,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS portfolio_slug_redirects (
  from_slug text PRIMARY KEY,
  to_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_post_previews (
  token_hash text PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES portfolio_posts (id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS portfolio_post_previews_post_idx ON portfolio_post_previews (post_id);

CREATE TABLE IF NOT EXISTS portfolio_login_failures (
  id bigserial PRIMARY KEY,
  key text NOT NULL,
  failed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS portfolio_login_failures_key_idx ON portfolio_login_failures (key, failed_at);

CREATE TABLE IF NOT EXISTS portfolio_contact_messages (
  id bigserial PRIMARY KEY,
  name text,
  email text,
  message text,
  ip_hash text,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed', 'spam')),
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS portfolio_contact_messages_ip_idx ON portfolio_contact_messages (ip_hash, created_at);
