INSERT INTO users (id, role_id, email, first_name, last_name)
VALUES
    ('10000000-0000-0000-0000-000000000101', (SELECT id FROM roles WHERE name = 'HOST'), 'host.alma@stayhaven.test', 'Alma', 'Lind'),
    ('10000000-0000-0000-0000-000000000102', (SELECT id FROM roles WHERE name = 'HOST'), 'host.mateo@stayhaven.test', 'Mateo', 'Silva'),
    ('10000000-0000-0000-0000-000000000103', (SELECT id FROM roles WHERE name = 'HOST'), 'host.nora@stayhaven.test', 'Nora', 'Kvist'),
    ('10000000-0000-0000-0000-000000000104', (SELECT id FROM roles WHERE name = 'HOST'), 'host.owen@stayhaven.test', 'Owen', 'Hart'),
    ('10000000-0000-0000-0000-000000000105', (SELECT id FROM roles WHERE name = 'HOST'), 'host.sofia@stayhaven.test', 'Sofia', 'Moss'),
    ('10000000-0000-0000-0000-000000000106', (SELECT id FROM roles WHERE name = 'HOST'), 'host.elias@stayhaven.test', 'Elias', 'Berg'),
    ('10000000-0000-0000-0000-000000000107', (SELECT id FROM roles WHERE name = 'HOST'), 'host.iris@stayhaven.test', 'Iris', 'Vale'),
    ('10000000-0000-0000-0000-000000000108', (SELECT id FROM roles WHERE name = 'HOST'), 'host.kai@stayhaven.test', 'Kai', 'Morgan'),
    ('10000000-0000-0000-0000-000000000109', (SELECT id FROM roles WHERE name = 'HOST'), 'host.lena@stayhaven.test', 'Lena', 'Nyberg'),
    ('10000000-0000-0000-0000-000000000110', (SELECT id FROM roles WHERE name = 'HOST'), 'host.remy@stayhaven.test', 'Remy', 'Cole'),
    ('10000000-0000-0000-0000-000000000111', (SELECT id FROM roles WHERE name = 'USER'), 'guest.ava@stayhaven.test', 'Ava', 'Brooks'),
    ('10000000-0000-0000-0000-000000000112', (SELECT id FROM roles WHERE name = 'USER'), 'guest.luca@stayhaven.test', 'Luca', 'Stone'),
    ('10000000-0000-0000-0000-000000000113', (SELECT id FROM roles WHERE name = 'USER'), 'guest.mina@stayhaven.test', 'Mina', 'Patel'),
    ('10000000-0000-0000-0000-000000000114', (SELECT id FROM roles WHERE name = 'USER'), 'guest.noah@stayhaven.test', 'Noah', 'Chen'),
    ('10000000-0000-0000-0000-000000000115', (SELECT id FROM roles WHERE name = 'USER'), 'guest.eva@stayhaven.test', 'Eva', 'Marin'),
    ('10000000-0000-0000-0000-000000000116', (SELECT id FROM roles WHERE name = 'USER'), 'guest.sam@stayhaven.test', 'Sam', 'Reyes'),
    ('10000000-0000-0000-0000-000000000117', (SELECT id FROM roles WHERE name = 'USER'), 'guest.juno@stayhaven.test', 'Juno', 'Hayes'),
    ('10000000-0000-0000-0000-000000000118', (SELECT id FROM roles WHERE name = 'USER'), 'guest.mika@stayhaven.test', 'Mika', 'Lane'),
    ('10000000-0000-0000-0000-000000000119', (SELECT id FROM roles WHERE name = 'USER'), 'guest.theo@stayhaven.test', 'Theo', 'Ford'),
    ('10000000-0000-0000-0000-000000000120', (SELECT id FROM roles WHERE name = 'USER'), 'guest.zara@stayhaven.test', 'Zara', 'Khan')
ON CONFLICT (email) DO UPDATE
SET role_id = EXCLUDED.role_id,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = now();

INSERT INTO user_settings (user_id, locale, timezone, marketing_emails_enabled)
VALUES
    ('10000000-0000-0000-0000-000000000101', 'en', 'Europe/Stockholm', true),
    ('10000000-0000-0000-0000-000000000102', 'en', 'Europe/Lisbon', true),
    ('10000000-0000-0000-0000-000000000103', 'en', 'Europe/Stockholm', false),
    ('10000000-0000-0000-0000-000000000104', 'en', 'Europe/London', true),
    ('10000000-0000-0000-0000-000000000105', 'en', 'Europe/Madrid', true),
    ('10000000-0000-0000-0000-000000000106', 'en', 'Europe/Oslo', false),
    ('10000000-0000-0000-0000-000000000107', 'en', 'Europe/Helsinki', true),
    ('10000000-0000-0000-0000-000000000108', 'en', 'Europe/Dublin', true),
    ('10000000-0000-0000-0000-000000000109', 'en', 'Europe/Stockholm', false),
    ('10000000-0000-0000-0000-000000000110', 'en', 'Europe/Paris', true),
    ('10000000-0000-0000-0000-000000000111', 'en', 'Europe/Stockholm', false),
    ('10000000-0000-0000-0000-000000000112', 'en', 'Europe/Rome', true),
    ('10000000-0000-0000-0000-000000000113', 'en', 'Europe/London', false),
    ('10000000-0000-0000-0000-000000000114', 'en', 'Europe/Amsterdam', true),
    ('10000000-0000-0000-0000-000000000115', 'en', 'Europe/Madrid', true),
    ('10000000-0000-0000-0000-000000000116', 'en', 'Europe/Stockholm', false),
    ('10000000-0000-0000-0000-000000000117', 'en', 'Europe/Copenhagen', true),
    ('10000000-0000-0000-0000-000000000118', 'en', 'Europe/Oslo', false),
    ('10000000-0000-0000-0000-000000000119', 'en', 'Europe/Berlin', true),
    ('10000000-0000-0000-0000-000000000120', 'en', 'Europe/Paris', false)
ON CONFLICT (user_id) DO UPDATE
SET locale = EXCLUDED.locale,
    timezone = EXCLUDED.timezone,
    marketing_emails_enabled = EXCLUDED.marketing_emails_enabled,
    updated_at = now();

INSERT INTO hosts (id, user_id, display_name, bio, status)
VALUES
    ('20000000-0000-0000-0000-000000000101', '10000000-0000-0000-0000-000000000101', 'Alma Lind Homes', 'Compact city stays with practical work areas and easy transit access.', 'PENDING_REVIEW'),
    ('20000000-0000-0000-0000-000000000102', '10000000-0000-0000-0000-000000000102', 'Mateo Coastal Rooms', 'Bright coastal rentals prepared for quiet weekends and remote work.', 'PENDING_REVIEW'),
    ('20000000-0000-0000-0000-000000000103', '10000000-0000-0000-0000-000000000103', 'Nora Kvist Retreats', 'Design-minded cabins and studios near trails, lakes, and small towns.', 'PENDING_REVIEW'),
    ('20000000-0000-0000-0000-000000000104', '10000000-0000-0000-0000-000000000104', 'Owen Hart Flats', 'Simple furnished flats for repeat travelers and project-based stays.', 'PENDING_REVIEW'),
    ('20000000-0000-0000-0000-000000000105', '10000000-0000-0000-0000-000000000105', 'Sofia Moss Collection', 'Warm homes with family-friendly layouts and stocked kitchens.', 'PENDING_REVIEW'),
    ('20000000-0000-0000-0000-000000000106', '10000000-0000-0000-0000-000000000106', 'Elias Berg Lodges', 'Low-key lodges and cottages for guests who want calmer stays.', 'PENDING_REVIEW'),
    ('20000000-0000-0000-0000-000000000107', '10000000-0000-0000-0000-000000000107', 'Iris Vale Stays', 'Small apartments with clear check-in flows and polished essentials.', 'PENDING_REVIEW'),
    ('20000000-0000-0000-0000-000000000108', '10000000-0000-0000-0000-000000000108', 'Kai Morgan Rentals', 'Flexible rentals near cafes, stations, and neighborhood high streets.', 'PENDING_REVIEW'),
    ('20000000-0000-0000-0000-000000000109', '10000000-0000-0000-0000-000000000109', 'Lena Nyberg Guesthomes', 'Quiet guesthomes with garden access and comfortable long-stay setups.', 'PENDING_REVIEW'),
    ('20000000-0000-0000-0000-000000000110', '10000000-0000-0000-0000-000000000110', 'Remy Cole Hideaways', 'Character rentals in smaller neighborhoods with thoughtful local notes.', 'PENDING_REVIEW')
ON CONFLICT (user_id) DO UPDATE
SET display_name = EXCLUDED.display_name,
    bio = EXCLUDED.bio,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO rental_properties (id, host_id, name, description, price_per_night)
VALUES
    ('40000000-0000-0000-0000-000000000101', '20000000-0000-0000-0000-000000000101', 'Canal Desk Studio', 'A focused studio near the water with a proper desk and morning light.', 118.00),
    ('40000000-0000-0000-0000-000000000102', '20000000-0000-0000-0000-000000000102', 'Blue Window Suite', 'A compact suite two streets from the promenade with a small breakfast nook.', 132.00),
    ('40000000-0000-0000-0000-000000000103', '20000000-0000-0000-0000-000000000102', 'Tide House Annex', 'A private annex with simple coastal interiors and quick beach access.', 156.00),
    ('40000000-0000-0000-0000-000000000104', '20000000-0000-0000-0000-000000000103', 'Pine Trail Cabin', 'A wood-lined cabin with a reading loft and trailhead access nearby.', 141.00),
    ('40000000-0000-0000-0000-000000000105', '20000000-0000-0000-0000-000000000103', 'Lake Path Studio', 'A quiet studio with lake views, blackout curtains, and a kitchenette.', 127.00),
    ('40000000-0000-0000-0000-000000000106', '20000000-0000-0000-0000-000000000103', 'Birch House Room', 'A private room in a calm guesthouse with shared sauna scheduling.', 109.00),
    ('40000000-0000-0000-0000-000000000107', '20000000-0000-0000-0000-000000000104', 'Station North Flat', 'A practical one-bedroom by rail links, groceries, and late cafes.', 122.00),
    ('40000000-0000-0000-0000-000000000108', '20000000-0000-0000-0000-000000000104', 'Brick Courtyard One', 'A rear-courtyard apartment with reliable Wi-Fi and a separate bedroom.', 135.00),
    ('40000000-0000-0000-0000-000000000109', '20000000-0000-0000-0000-000000000104', 'Market Street Loft', 'A loft above a quiet side street with a compact kitchen and workspace.', 148.00),
    ('40000000-0000-0000-0000-000000000110', '20000000-0000-0000-0000-000000000104', 'Green Line Apartment', 'A tidy apartment close to tram lines and neighborhood parks.', 119.00),
    ('40000000-0000-0000-0000-000000000111', '20000000-0000-0000-0000-000000000105', 'Sunroom Family Flat', 'A two-bedroom flat with a bright dining area and child-friendly storage.', 176.00),
    ('40000000-0000-0000-0000-000000000112', '20000000-0000-0000-0000-000000000105', 'Olive Kitchen House', 'A small house with an oversized kitchen, patio seating, and laundry.', 188.00),
    ('40000000-0000-0000-0000-000000000113', '20000000-0000-0000-0000-000000000105', 'Corner Pantry Stay', 'A practical home base with stocked pantry basics and two work surfaces.', 164.00),
    ('40000000-0000-0000-0000-000000000114', '20000000-0000-0000-0000-000000000105', 'Garden Gate Duplex', 'A duplex with garden access, two bedrooms, and flexible sleeping space.', 203.00),
    ('40000000-0000-0000-0000-000000000115', '20000000-0000-0000-0000-000000000105', 'Terrace Room Flat', 'A calm upper-floor flat with terrace seating and evening sun.', 152.00),
    ('40000000-0000-0000-0000-000000000116', '20000000-0000-0000-0000-000000000106', 'Ridge View Lodge', 'A pared-back lodge with big windows and space to unpack for a week.', 169.00),
    ('40000000-0000-0000-0000-000000000117', '20000000-0000-0000-0000-000000000107', 'Keyless City Nest', 'A small apartment with keyless access, soft linens, and fast transit.', 126.00),
    ('40000000-0000-0000-0000-000000000118', '20000000-0000-0000-0000-000000000107', 'Atrium Micro Loft', 'A micro loft facing an indoor atrium with a compact work counter.', 112.00),
    ('40000000-0000-0000-0000-000000000119', '20000000-0000-0000-0000-000000000108', 'Cafe Corner Studio', 'A bright studio above a quiet cafe block with blackout shades.', 131.00),
    ('40000000-0000-0000-0000-000000000120', '20000000-0000-0000-0000-000000000108', 'High Street Two-Room', 'A two-room apartment close to shops, trains, and evening restaurants.', 158.00),
    ('40000000-0000-0000-0000-000000000121', '20000000-0000-0000-0000-000000000108', 'Transit Garden Flat', 'A garden-level flat with easy station access and a small outdoor table.', 144.00),
    ('40000000-0000-0000-0000-000000000122', '20000000-0000-0000-0000-000000000109', 'Willow Guesthome', 'A quiet guesthome with garden doors, a kitchenette, and warm lighting.', 138.00),
    ('40000000-0000-0000-0000-000000000123', '20000000-0000-0000-0000-000000000109', 'Shed Roof Studio', 'A private studio with skylights, laundry access, and a small sofa.', 124.00),
    ('40000000-0000-0000-0000-000000000124', '20000000-0000-0000-0000-000000000109', 'Back Garden Suite', 'A one-bedroom suite with garden views and a comfortable dining table.', 151.00),
    ('40000000-0000-0000-0000-000000000125', '20000000-0000-0000-0000-000000000109', 'Long-Stay Cottage', 'A compact cottage set up for longer stays with storage and laundry.', 172.00),
    ('40000000-0000-0000-0000-000000000126', '20000000-0000-0000-0000-000000000110', 'Old Quarter Hideaway', 'A character one-bedroom tucked behind a quiet square.', 146.00),
    ('40000000-0000-0000-0000-000000000127', '20000000-0000-0000-0000-000000000110', 'Library Lane Flat', 'A restful flat near bookshops, transit, and a small weekly market.', 133.00),
    ('40000000-0000-0000-0000-000000000128', '20000000-0000-0000-0000-000000000110', 'Stone Walk Studio', 'A studio with simple stone-floor character and a compact kitchenette.', 117.00),
    ('40000000-0000-0000-0000-000000000129', '20000000-0000-0000-0000-000000000110', 'Courtyard Writer Room', 'A quiet room facing a courtyard with a writing desk and soft chair.', 104.00),
    ('40000000-0000-0000-0000-000000000130', '20000000-0000-0000-0000-000000000110', 'Neighborhood Roof Flat', 'A top-floor flat with rooftop glimpses and a calm living room.', 162.00)
ON CONFLICT (id) DO UPDATE
SET host_id = EXCLUDED.host_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_per_night = EXCLUDED.price_per_night,
    updated_at = now();
