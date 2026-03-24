-- Deadline Activities (comments & audit trail)
CREATE TABLE IF NOT EXISTS deadline_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  deadline_id uuid NOT NULL REFERENCES deadlines(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('status_change', 'comment', 'assignment')),
  content text NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_deadline_activities_deadline_id ON deadline_activities(deadline_id);

-- Deadline Dependencies
CREATE TABLE IF NOT EXISTS deadline_dependencies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  deadline_id uuid NOT NULL REFERENCES deadlines(id) ON DELETE CASCADE,
  depends_on_id uuid NOT NULL REFERENCES deadlines(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(deadline_id, depends_on_id),
  CHECK(deadline_id != depends_on_id)
);

CREATE INDEX idx_deadline_dependencies_deadline_id ON deadline_dependencies(deadline_id);
CREATE INDEX idx_deadline_dependencies_depends_on_id ON deadline_dependencies(depends_on_id);

-- Enable RLS
ALTER TABLE deadline_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadline_dependencies ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow authenticated users)
CREATE POLICY "Authenticated users can read activities"
  ON deadline_activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert activities"
  ON deadline_activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read dependencies"
  ON deadline_dependencies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage dependencies"
  ON deadline_dependencies FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
