ALTER TABLE conversations ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS conversation_id UUID;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_team_conversation') THEN 
        ALTER TABLE teams ADD CONSTRAINT fk_team_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL; 
    END IF; 
END;
$$;