UPDATE users
SET email = id || '.renumbering@stayhaven.test',
    updated_at = now()
WHERE email LIKE 'host%@stayhaven.test';

WITH numbered_hosts AS (
    SELECT
        id,
        row_number() OVER (ORDER BY created_at, id) - 1 AS host_index
    FROM users
    WHERE email LIKE '%.renumbering@stayhaven.test'
)
UPDATE users
SET email = 'host' || numbered_hosts.host_index || '@stayhaven.test',
    updated_at = now()
FROM numbered_hosts
WHERE users.id = numbered_hosts.id;
