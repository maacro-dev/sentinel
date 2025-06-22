ALTER TABLE users
  ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'disabled'));

ALTER TABLE users
  ADD COLUMN last_active TIMESTAMP;
