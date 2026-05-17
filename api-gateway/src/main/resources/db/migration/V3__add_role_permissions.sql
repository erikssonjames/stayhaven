CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

DO $$
DECLARE
    guest_role_id UUID;
    user_role_id UUID;
BEGIN
    SELECT id INTO guest_role_id FROM roles WHERE name = 'GUEST';
    SELECT id INTO user_role_id FROM roles WHERE name = 'USER';

    IF guest_role_id IS NOT NULL AND user_role_id IS NULL THEN
        UPDATE roles
        SET name = 'USER',
            description = 'Standard user'
        WHERE id = guest_role_id;
    ELSIF guest_role_id IS NOT NULL THEN
        UPDATE users
        SET role_id = user_role_id
        WHERE role_id = guest_role_id;

        DELETE FROM roles
        WHERE id = guest_role_id;
    END IF;
END $$;

INSERT INTO roles (name, description)
VALUES
    ('USER', 'Standard user'),
    ('SUPERADMIN', 'Superadmin user')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

UPDATE roles
SET description = CASE name
    WHEN 'HOST' THEN 'Host user'
    WHEN 'ADMIN' THEN 'Admin user'
    ELSE description
END
WHERE name IN ('HOST', 'ADMIN');

INSERT INTO permissions (name, description)
VALUES
    ('BOOKING_CREATE_OWN', 'Create own bookings'),
    ('BOOKING_MANAGE_OWN', 'Manage own bookings'),
    ('SETTINGS_MANAGE_OWN', 'Manage own settings'),
    ('USER_CREATE', 'Create user accounts'),
    ('USER_UPDATE_OWN', 'Update own user account'),
    ('RENTAL_MANAGE_OWN', 'Create and manage own rentals'),
    ('HOST_CREATE', 'Create hosts'),
    ('HOST_ACCEPT', 'Accept hosts'),
    ('BOOKING_MANAGE_ALL', 'Manage all bookings'),
    ('RENTAL_MANAGE_ALL', 'Manage all rentals'),
    ('USER_MANAGE_ALL', 'Manage all users'),
    ('HOST_MANAGE_ALL', 'Manage all hosts'),
    ('ADMIN_MANAGE', 'Manage admins'),
    ('PAYMENT_VIEW', 'View payments')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
JOIN permissions ON permissions.name IN (
    'BOOKING_CREATE_OWN',
    'BOOKING_MANAGE_OWN',
    'SETTINGS_MANAGE_OWN',
    'USER_CREATE',
    'USER_UPDATE_OWN'
)
WHERE roles.name = 'USER'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
JOIN permissions ON permissions.name IN (
    'RENTAL_MANAGE_OWN'
)
WHERE roles.name = 'HOST'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
JOIN permissions ON permissions.name IN (
    'HOST_CREATE',
    'HOST_ACCEPT',
    'BOOKING_MANAGE_ALL',
    'RENTAL_MANAGE_ALL',
    'USER_MANAGE_ALL',
    'HOST_MANAGE_ALL'
)
WHERE roles.name = 'ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
JOIN permissions ON permissions.name IN (
    'BOOKING_CREATE_OWN',
    'BOOKING_MANAGE_OWN',
    'SETTINGS_MANAGE_OWN',
    'USER_CREATE',
    'USER_UPDATE_OWN',
    'RENTAL_MANAGE_OWN',
    'HOST_CREATE',
    'HOST_ACCEPT',
    'BOOKING_MANAGE_ALL',
    'RENTAL_MANAGE_ALL',
    'USER_MANAGE_ALL',
    'HOST_MANAGE_ALL',
    'ADMIN_MANAGE',
    'PAYMENT_VIEW'
)
WHERE roles.name = 'SUPERADMIN'
ON CONFLICT DO NOTHING;
