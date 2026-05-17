ALTER TABLE bookings
    DROP CONSTRAINT IF EXISTS no_overlapping_active_bookings_per_rental;

ALTER TABLE bookings
    ADD COLUMN listing_id VARCHAR(100);

UPDATE bookings
SET listing_id = rental_id::text
WHERE listing_id IS NULL;

ALTER TABLE bookings
    ALTER COLUMN listing_id SET NOT NULL;

ALTER TABLE bookings
    DROP COLUMN rental_id;
