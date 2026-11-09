-- Allow the developer role used by the application's privileged developer area.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('teacher', 'diretor', 'admin', 'dev'));
