-- Consolidate the former admin role into developer, which retains its global permissions.
UPDATE users
SET role = 'dev'
WHERE role = 'admin';

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('teacher', 'diretor', 'dev'));
