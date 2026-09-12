-- Studia Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  uid UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  displayName TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'diretor', 'admin')),
  subject TEXT
);

-- Schedules table (aulas/horários)
CREATE TABLE IF NOT EXISTS schedules (
  id BIGSERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  subject TEXT NOT NULL,
  room TEXT NOT NULL,
  teacherId UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  teacherName TEXT NOT NULL,
  classGroup TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'absent', 'vaga')),
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lab bookings table (reservas de laboratório)
CREATE TABLE IF NOT EXISTS lab_bookings (
  id BIGSERIAL PRIMARY KEY,
  labId TEXT NOT NULL CHECK (labId IN ('info', 'chem')),
  teacherId UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  teacherName TEXT NOT NULL,
  date TEXT NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL
);

-- Certificates table (atestados médicos)
CREATE TABLE IF NOT EXISTS certificates (
  id BIGSERIAL PRIMARY KEY,
  teacherId UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  teacherName TEXT NOT NULL,
  date TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  imageUrl TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_schedules_teacherId ON schedules(teacherId);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_lab_bookings_teacherId ON lab_bookings(teacherId);
CREATE INDEX IF NOT EXISTS idx_lab_bookings_date ON lab_bookings(date);
CREATE INDEX IF NOT EXISTS idx_certificates_teacherId ON certificates(teacherId);
CREATE INDEX IF NOT EXISTS idx_certificates_date ON certificates(date);

-- Insert sample data (opcional - você pode deletar depois)
INSERT INTO users (uid, email, displayName, role, subject) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@escola.com', 'Administrador', 'admin', NULL),
  ('550e8400-e29b-41d4-a716-446655440002', 'diretor@escola.com', 'Diretor da Escola', 'diretor', NULL),
  ('550e8400-e29b-41d4-a716-446655440003', 'professor@escola.com', 'Professor João', 'teacher', 'Matemática')
ON CONFLICT DO NOTHING;
