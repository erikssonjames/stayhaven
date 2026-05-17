ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_listing_id ON bookings(listing_id);

ALTER TABLE bookings
    DROP CONSTRAINT IF EXISTS no_overlapping_active_bookings_per_listing;

ALTER TABLE bookings
    ADD CONSTRAINT no_overlapping_active_bookings_per_listing
        EXCLUDE USING gist (
        listing_id WITH =,
        daterange(check_in_date, check_out_date, '[)') WITH &&
        )
        WHERE (status IN ('RESERVED', 'REQUESTED', 'CONFIRMED'));
