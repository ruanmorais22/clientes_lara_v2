CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id BIGINT NOT NULL REFERENCES "Prompts"(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row update
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON checklist_items
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Enable RLS
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Policies for checklist_items
CREATE POLICY "Allow all access to authenticated users"
ON checklist_items
FOR ALL
TO authenticated
USING (true);
