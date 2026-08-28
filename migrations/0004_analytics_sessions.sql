CREATE TABLE IF NOT EXISTS analytics_sessions (
  session_id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  page_views INTEGER NOT NULL DEFAULT 0,
  artwork_views INTEGER NOT NULL DEFAULT 0
);

