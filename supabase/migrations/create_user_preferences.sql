CREATE TABLE IF NOT EXISTS user_preferences (
  id bigserial PRIMARY KEY,
  user_email text UNIQUE NOT NULL,
  simcar_status_filter text DEFAULT 'all',
  simcar_search_term text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own preferences
CREATE POLICY "select_own_prefs"
ON user_preferences FOR SELECT
TO authenticated
USING (user_email = (auth.jwt() ->> 'email'));

-- Allow authenticated users to insert their own preferences
CREATE POLICY "insert_own_prefs"
ON user_preferences FOR INSERT
TO authenticated
WITH CHECK (user_email = (auth.jwt() ->> 'email'));

-- Allow authenticated users to update their own preferences
CREATE POLICY "update_own_prefs"
ON user_preferences FOR UPDATE
TO authenticated
USING (user_email = (auth.jwt() ->> 'email'))
WITH CHECK (user_email = (auth.jwt() ->> 'email'));
