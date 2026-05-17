INSERT INTO users (id, role_id, email, first_name, last_name)
VALUES
    ('10000000-0000-0000-0000-000000000001', (SELECT id FROM roles WHERE name = 'USER'), 'user@stayhaven.test', 'Maya', 'Stone'),
    ('10000000-0000-0000-0000-000000000002', (SELECT id FROM roles WHERE name = 'HOST'), 'host@stayhaven.test', 'Jonas', 'Reed'),
    ('10000000-0000-0000-0000-000000000003', (SELECT id FROM roles WHERE name = 'ADMIN'), 'admin@stayhaven.test', 'Priya', 'Nair'),
    ('10000000-0000-0000-0000-000000000004', (SELECT id FROM roles WHERE name = 'SUPERADMIN'), 'superadmin@stayhaven.test', 'Elena', 'Vale')
ON CONFLICT (email) DO UPDATE
SET role_id = EXCLUDED.role_id,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = now();

INSERT INTO user_settings (user_id, locale, timezone, marketing_emails_enabled)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'en', 'Europe/Stockholm', true),
    ('10000000-0000-0000-0000-000000000002', 'en', 'Europe/Stockholm', true),
    ('10000000-0000-0000-0000-000000000003', 'en', 'Europe/Stockholm', false),
    ('10000000-0000-0000-0000-000000000004', 'en', 'Europe/Stockholm', false)
ON CONFLICT (user_id) DO UPDATE
SET locale = EXCLUDED.locale,
    timezone = EXCLUDED.timezone,
    marketing_emails_enabled = EXCLUDED.marketing_emails_enabled,
    updated_at = now();

INSERT INTO hosts (id, user_id, display_name, bio, status)
VALUES (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    'Nordic Harbor Stays',
    'Calm city apartments and coastal homes prepared for flexible mid-term stays.',
    'ACCEPTED'
)
ON CONFLICT (user_id) DO UPDATE
SET display_name = EXCLUDED.display_name,
    bio = EXCLUDED.bio,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO admins (id, user_id)
VALUES
    ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003'),
    ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004')
ON CONFLICT (user_id) DO UPDATE
SET updated_at = now();

INSERT INTO rental_properties (id, host_id, name, description, price_per_night)
SELECT
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Harbor Loft',
    'A bright two-room loft near transit, water, and coworking spaces.',
    149.00
WHERE NOT EXISTS (
    SELECT 1 FROM rental_properties WHERE id = '40000000-0000-0000-0000-000000000001'
);

INSERT INTO bookings (id, user_id, host_id, listing_id, check_in_date, check_out_date, status)
SELECT
    '50000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    CURRENT_DATE + INTERVAL '14 days',
    CURRENT_DATE + INTERVAL '20 days',
    'CONFIRMED'
WHERE NOT EXISTS (
    SELECT 1 FROM bookings WHERE id = '50000000-0000-0000-0000-000000000001'
);
