-- ======================================
-- FASE 1: Multi-Tenant - Banco de Dados
-- ======================================
-- Criada em: 2026-09-12
-- Descrição: Adiciona suporte a múltiplas escolas (multi-tenant)

-- ======================================
-- 1. CRIAR TABELA: SCHOOLS
-- ======================================

CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  createdBy UUID REFERENCES users(uid) ON DELETE SET NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- 2. ADICIONAR school_id ÀS TABELAS
-- ======================================

-- 2.1 users
ALTER TABLE users ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;

-- 2.2 schedules
ALTER TABLE schedules ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;

-- 2.3 lab_bookings
ALTER TABLE lab_bookings ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;

-- 2.4 certificates
ALTER TABLE certificates ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;

-- ======================================
-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- ======================================

CREATE INDEX IF NOT EXISTS idx_schools_createdBy ON schools(createdBy);

CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_school_id_role ON users(school_id, role);

CREATE INDEX IF NOT EXISTS idx_schedules_school_id ON schedules(school_id);
CREATE INDEX IF NOT EXISTS idx_schedules_teacherId ON schedules(teacherId);
CREATE INDEX IF NOT EXISTS idx_schedules_school_id_teacherId ON schedules(school_id, teacherId);

CREATE INDEX IF NOT EXISTS idx_lab_bookings_school_id ON lab_bookings(school_id);
CREATE INDEX IF NOT EXISTS idx_lab_bookings_teacherId ON lab_bookings(teacherId);

CREATE INDEX IF NOT EXISTS idx_certificates_school_id ON certificates(school_id);
CREATE INDEX IF NOT EXISTS idx_certificates_teacherId ON certificates(teacherId);

-- ======================================
-- 4. DADOS DE TESTE (OPCIONAL)
-- ======================================
-- Descomente se quiser dados de teste

/*
-- Criar escola de teste
INSERT INTO schools (name, createdBy) VALUES
  ('Escola Padrão', (SELECT uid FROM users WHERE role = 'admin' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Associar usuários existentes à escola padrão
UPDATE users SET school_id = (SELECT id FROM schools LIMIT 1)
WHERE school_id IS NULL AND role IN ('teacher', 'diretor');

-- Associar aulas à escola do professor
UPDATE schedules SET school_id = (
  SELECT school_id FROM users WHERE uid = schedules.teacherId LIMIT 1
)
WHERE school_id IS NULL;

-- Associar reservas à escola do professor
UPDATE lab_bookings SET school_id = (
  SELECT school_id FROM users WHERE uid = lab_bookings.teacherId LIMIT 1
)
WHERE school_id IS NULL;

-- Associar atestados à escola do professor
UPDATE certificates SET school_id = (
  SELECT school_id FROM users WHERE uid = certificates.teacherId LIMIT 1
)
WHERE school_id IS NULL;
*/

-- ======================================
-- 5. VALIDAR ESTRUTURA
-- ======================================
-- Rode essas queries DEPOIS para conferir tudo criou:

/*
-- Ver estrutura da tabela schools
\d schools

-- Ver school_id nas tables
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name IN ('users', 'schedules', 'lab_bookings', 'certificates')
AND column_name = 'school_id';

-- Ver índices criados
SELECT * FROM pg_indexes
WHERE tablename IN ('schools', 'users', 'schedules', 'lab_bookings', 'certificates')
ORDER BY tablename, indexname;

-- Contar registros (tudo deve estar 0 ou NULL no início)
SELECT COUNT(*) FROM schools;
SELECT COUNT(*) FROM users WHERE school_id IS NOT NULL;
*/

-- ======================================
-- PRÓXIMAS FASES
-- ======================================
-- Fase 1 (Banco): COMPLETA ✅
-- Fase 2 (Backend): server.ts com filtros por school_id
-- Fase 3 (Frontend): AdminView para gerenciar escolas
-- Fase 4 (Testes): Validar isolamento de dados
-- Fase 5 (Deploy): Vercel/Railway
