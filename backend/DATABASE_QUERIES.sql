-- ==============================================================================
--  UMLAB — SQL QUERIES
--  Generated from DATABASE_SCHEMA.txt
--  Compatible with PostgreSQL
-- ==============================================================================


-- ==============================================================================
--  CREATE TABLES
-- ==============================================================================

-- NOTE: auth_user is created automatically by Django's migration system.
-- The CREATE TABLE below is shown for reference only.

CREATE TABLE IF NOT EXISTS auth_user (
    id          SERIAL          PRIMARY KEY,
    username    VARCHAR(150)    NOT NULL UNIQUE,
    email       VARCHAR(254)    NOT NULL,
    password    VARCHAR(128)    NOT NULL,
    first_name  VARCHAR(150)    NOT NULL DEFAULT '',
    last_name   VARCHAR(150)    NOT NULL DEFAULT '',
    is_staff    BOOLEAN         NOT NULL DEFAULT FALSE,
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    is_superuser BOOLEAN        NOT NULL DEFAULT FALSE,
    date_joined TIMESTAMP WITH TIME ZONE NOT NULL,
    last_login  TIMESTAMP WITH TIME ZONE NULL
);

-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS schedule_schedule (
    id              SERIAL          PRIMARY KEY,
    room            VARCHAR(50)     NOT NULL,
    teacher_name    VARCHAR(200)    NOT NULL,
    class_time_in   TIME            NOT NULL,
    class_time_out  TIME            NOT NULL,
    class_schedule  VARCHAR(20)     NOT NULL CHECK (class_schedule IN ('mon-wed', 'thur-sat')),
    class_code      VARCHAR(50)     NOT NULL,
    course          VARCHAR(100)    NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'tentative' CHECK (status IN ('official', 'tentative')),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS dashboard_attendance (
    id          SERIAL          PRIMARY KEY,
    schedule_id INTEGER         NOT NULL REFERENCES schedule_schedule(id) ON DELETE CASCADE,
    date        DATE            NOT NULL,
    status      VARCHAR(20)     NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'present', 'absent')),
    total_hours DECIMAL(6, 2)   NOT NULL DEFAULT 0,
    UNIQUE (schedule_id, date)
);

-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS reservation_reservation (
    id              SERIAL          PRIMARY KEY,
    borrower_name   VARCHAR(200)    NOT NULL,
    class_code      VARCHAR(50)     NOT NULL,
    teacher_name    VARCHAR(200)    NOT NULL,
    date_filed      DATE            NOT NULL,
    date_of_use     DATE            NOT NULL,
    room_num        VARCHAR(50)     NOT NULL,
    date_of_return  DATE            NOT NULL,
    course          VARCHAR(100)    NOT NULL,
    college         VARCHAR(200)    NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'unapproved' CHECK (status IN ('unapproved', 'approved')),
    class_hours     DECIMAL(5, 2)   NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS reservation_reservationequipment (
    id              SERIAL      PRIMARY KEY,
    reservation_id  INTEGER     NOT NULL REFERENCES reservation_reservation(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    quantity        INTEGER     NOT NULL CHECK (quantity > 0)
);

-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS students_studentgroup (
    id              SERIAL          PRIMARY KEY,
    teacher_name    VARCHAR(200)    NOT NULL,
    class_time_in   TIME            NOT NULL,
    class_time_out  TIME            NOT NULL,
    class_schedule  VARCHAR(10)     NOT NULL CHECK (class_schedule IN ('mtw', 'thfs')),
    class_code      VARCHAR(50)     NOT NULL,
    course          VARCHAR(100)    NOT NULL,
    attendance_file VARCHAR(255)    NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kiosk_equipment (
    id                  SERIAL          PRIMARY KEY,
    name                VARCHAR(200)    NOT NULL,
    lab                 VARCHAR(50)     NOT NULL CHECK (lab IN ('physics','biology','civil','chemistry','culinary','electrical','mechanical','hydraulic')),
    image               VARCHAR(255)    NULL,
    available_quantity  INTEGER         NOT NULL DEFAULT 1 CHECK (available_quantity >= 0)
);


-- ==============================================================================
--  INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_attendance_schedule   ON dashboard_attendance (schedule_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date       ON dashboard_attendance (date);
CREATE INDEX IF NOT EXISTS idx_reservation_status    ON reservation_reservation (status);
CREATE INDEX IF NOT EXISTS idx_reservation_created   ON reservation_reservation (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resequip_reservation  ON reservation_reservationequipment (reservation_id);
CREATE INDEX IF NOT EXISTS idx_schedule_time         ON schedule_schedule (class_time_in);
CREATE INDEX IF NOT EXISTS idx_studentgroup_time     ON students_studentgroup (class_time_in);
CREATE INDEX IF NOT EXISTS idx_equipment_lab         ON kiosk_equipment (lab);


-- ==============================================================================
--  SAMPLE QUERIES (CRUD per feature)
-- ==============================================================================

-- ── SCHEDULE ──────────────────────────────────────────────────────────────────

-- List all schedules ordered by time
SELECT * FROM schedule_schedule ORDER BY class_time_in ASC;

-- Filter by session (morning = before 12:00)
SELECT * FROM schedule_schedule WHERE class_time_in < '12:00:00' ORDER BY class_time_in ASC;

-- Insert a schedule
INSERT INTO schedule_schedule (room, teacher_name, class_time_in, class_time_out, class_schedule, class_code, course, status)
VALUES ('101', 'Dr. Santos', '08:00', '10:00', 'mon-wed', 'PHY101', 'BS Physics', 'official');

-- Update a schedule status
UPDATE schedule_schedule SET status = 'official', updated_at = NOW() WHERE id = 1;

-- Delete a schedule (cascades to dashboard_attendance)
DELETE FROM schedule_schedule WHERE id = 1;


-- ── DASHBOARD / ATTENDANCE ────────────────────────────────────────────────────

-- Get or create attendance for a schedule on a given date
INSERT INTO dashboard_attendance (schedule_id, date, status, total_hours)
VALUES (1, CURRENT_DATE, 'pending', 0)
ON CONFLICT (schedule_id, date) DO NOTHING;

-- List attendance for a schedule
SELECT * FROM dashboard_attendance WHERE schedule_id = 1 ORDER BY date DESC;

-- Mark present and set hours
UPDATE dashboard_attendance SET status = 'present', total_hours = 2.00 WHERE schedule_id = 1 AND date = CURRENT_DATE;


-- ── RESERVATION ───────────────────────────────────────────────────────────────

-- List all unapproved reservations
SELECT * FROM reservation_reservation WHERE status = 'unapproved' ORDER BY created_at DESC;

-- List with equipment (JOIN)
SELECT r.*, e.name AS equip_name, e.quantity
FROM reservation_reservation r
JOIN reservation_reservationequipment e ON e.reservation_id = r.id
ORDER BY r.created_at DESC;

-- Insert a reservation (kiosk flow)
INSERT INTO reservation_reservation (borrower_name, class_code, teacher_name, date_filed, date_of_use, room_num, date_of_return, course, college, status)
VALUES ('Juan dela Cruz', 'PHY101', 'Dr. Santos', CURRENT_DATE, '2026-03-15', 'Physics Lab', '2026-03-15', 'BS Physics', 'College of Engineering', 'unapproved');

-- Insert equipment for that reservation
INSERT INTO reservation_reservationequipment (reservation_id, name, quantity)
VALUES (1, 'Microscope', 2);

-- Approve a reservation
UPDATE reservation_reservation SET status = 'approved', updated_at = NOW() WHERE id = 1;


-- ── STUDENTS ──────────────────────────────────────────────────────────────────

-- List all student groups ordered by time
SELECT * FROM students_studentgroup ORDER BY class_time_in ASC;

-- Insert a student group
INSERT INTO students_studentgroup (teacher_name, class_time_in, class_time_out, class_schedule, class_code, course)
VALUES ('Dr. Santos', '08:00', '10:00', 'mtw', 'PHY101', 'BS Physics');

-- Delete a student group
DELETE FROM students_studentgroup WHERE id = 1;


-- ── KIOSK EQUIPMENT ───────────────────────────────────────────────────────────

-- List all physics equipment
SELECT * FROM kiosk_equipment WHERE lab = 'physics' ORDER BY name ASC;

-- Insert equipment
INSERT INTO kiosk_equipment (name, lab, available_quantity)
VALUES ('Oscilloscope', 'physics', 5);

-- Update available quantity
UPDATE kiosk_equipment SET available_quantity = available_quantity - 1 WHERE id = 1;


-- ── AUTH / USERS ──────────────────────────────────────────────────────────────

-- Find user by email (used in signin)
SELECT * FROM auth_user WHERE LOWER(email) = LOWER('user@example.com');

-- Check if email already registered (used in signup)
SELECT COUNT(*) FROM auth_user WHERE LOWER(email) = LOWER('user@example.com');


-- ==============================================================================
