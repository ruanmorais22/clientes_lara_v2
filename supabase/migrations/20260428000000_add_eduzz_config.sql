-- Add eduzz_config JSONB column to Prompts table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Prompts' AND column_name = 'eduzz_config'
    ) THEN
        ALTER TABLE "Prompts" ADD COLUMN eduzz_config JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;
