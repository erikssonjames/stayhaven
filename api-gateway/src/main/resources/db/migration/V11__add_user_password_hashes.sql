ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

UPDATE users
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE password_hash IS NULL;

ALTER TABLE users
    ALTER COLUMN password_hash SET NOT NULL;
