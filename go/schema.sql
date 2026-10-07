CREATE TABLE IF NOT EXISTS taps (
  id INTEGER PRIMARY KEY,
  at TEXT NOT NULL,      -- ISO 8601, UTC
  shop TEXT NOT NULL,    -- slug from redirects.json
  country TEXT,          -- two-letter code from Cloudflare
  source TEXT            -- optional ?src= from the app
);
CREATE INDEX IF NOT EXISTS taps_at ON taps (at);
