UPDATE hosts
SET status = 'ACTIVE',
    updated_at = now()
WHERE status = 'ACCEPTED';
