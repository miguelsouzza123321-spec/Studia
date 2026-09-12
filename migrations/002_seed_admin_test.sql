-- ======================================
-- SEED: Criar Admin de Teste
-- ======================================
-- Executar DEPOIS de criar a conta via signup normal
-- ou usar para testes locais

-- 1. Criar escola padrão para admin
INSERT INTO schools (name, createdBy) VALUES
  ('Colégio Estadual Prof. Júlio Szymanski', NULL)
ON CONFLICT DO NOTHING;

-- 2. OPÇÃO A: Se você já fez cadastro normal como professor
-- Pegue o UID do usuário e roda isso:
-- UPDATE users SET role = 'admin', school_id = (SELECT id FROM schools LIMIT 1)
-- WHERE email = 'seu-email@aqui.com';

-- 3. OPÇÃO B: Se quer criar admin direto no banco (sem Supabase Auth)
-- AVISO: Isso só funciona se você já tiver um usuário no Auth
-- Pegue o UID do Supabase Auth e use abaixo:
INSERT INTO users (
  uid,
  email,
  displayName,
  role,
  school_id,
  subject
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000', -- MUDE PARA O UID REAL
  'admin@estudia.test',
  'Administrador Sistema',
  'admin',
  (SELECT id FROM schools LIMIT 1),
  NULL
)
ON CONFLICT (uid) DO NOTHING;

-- 4. Criar diretor de teste para Escola A
INSERT INTO schools (name, createdBy) VALUES
  ('Escola A - Teste', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO users (
  uid,
  email,
  displayName,
  role,
  school_id,
  subject
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001', -- MUDE PARA O UID REAL
  'diretor-a@estudia.test',
  'Diretor Escola A',
  'diretor',
  (SELECT id FROM schools WHERE name = 'Escola A - Teste' LIMIT 1),
  NULL
)
ON CONFLICT (uid) DO NOTHING;

-- 5. Verificar dados criados
SELECT * FROM schools;
SELECT uid, email, displayName, role, school_id FROM users WHERE role IN ('admin', 'diretor');
