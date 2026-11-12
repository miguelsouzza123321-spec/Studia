-- Remove the vacant-lesson status and prepare school-wide lab availability.
-- Historical certificate records are intentionally left untouched.
BEGIN;

UPDATE schedules
SET status = 'confirmed'
WHERE status = 'vaga';

ALTER TABLE schedules
  DROP CONSTRAINT IF EXISTS schedules_status_check;

ALTER TABLE schedules
  ADD CONSTRAINT schedules_status_check
  CHECK (status IN ('pending', 'confirmed', 'absent'));

UPDATE lab_bookings AS booking
SET school_id = teacher.school_id
FROM users AS teacher
WHERE booking.teacherId = teacher.uid
  AND booking.school_id IS NULL
  AND teacher.school_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lab_bookings_school_lab_date
  ON lab_bookings (school_id, labId, date);

COMMIT;
