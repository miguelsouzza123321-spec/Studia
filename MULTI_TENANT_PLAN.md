# Plano Multi-Tenant: Studia com Múltiplas Escolas

**Prazo:** < 1 mês  
**Objetivo:** Admin cria diretores → Diretor cria professores → Sistema gerenciável por escola

---

## 1. ARQUITETURA

### Hierarquia
```
Admin (plataforma global)
  ├─ Diretor Escola A (gerencia apenas Escola A)
  │  ├─ Professor 1 (Escola A)
  │  ├─ Professor 2 (Escola A)
  │  └─ Aulas/Labs/Atestados (Escola A)
  └─ Diretor Escola B (gerencia apenas Escola B)
     ├─ Professor 1 (Escola B)
     └─ Aulas/Labs/Atestados (Escola B)
```

### Isolamento
- Admin vê **todas** as escolas
- Diretor vê **apenas sua escola**
- Professor vê **apenas seus dados**

---

## 2. MUDANÇAS NO BANCO DE DADOS

### A. Nova tabela: `schools`
```sql
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  createdBy UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### B. Adicionar `school_id` às tabelas existentes
```sql
ALTER TABLE users ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE schedules ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE lab_bookings ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE certificates ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;

-- Índices para performance
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_schedules_school_id ON schedules(school_id);
CREATE INDEX idx_lab_bookings_school_id ON lab_bookings(school_id);
CREATE INDEX idx_certificates_school_id ON certificates(school_id);
```

### C. Atualizar coluna `role`
```sql
-- Renomear se necessário para esclarecer que é escopo local
-- Não muda: teacher, diretor, admin (admin é global, diretor é por escola)
-- Teacher é local à escola
```

---

## 3. MUDANÇAS NO CÓDIGO

### A. `server.ts` — Roteamento por Escola

#### Registrar usuário
```typescript
// POST /api/auth/register
// Agora requer school_id (diretor criando professor) ou é criado sem escola (admin cria primeiro diretor)
const { email, password, displayName, subject, school_id, role } = req.body;

// Validar role
if (role && !['teacher', 'diretor', 'admin'].includes(role)) {
  return res.status(400).json({ error: 'Role inválido' });
}

// Se diretor está criando professor, validar que é diretor da escola
if (school_id && role === 'teacher') {
  // Verificar se quem está criando é diretor daquela escola
  // (isso vai ser verificado client-side, mas server também valida)
}

const finalRole = role || 'teacher';
const { data, error } = await supabase
  .from('users')
  .insert({ uid, email, displayName, role: finalRole, subject, school_id })
  .select('*')
  .single();
```

#### Filtrar dados por school_id
```typescript
// GET /api/schedules — filtrar por school_id do usuário
if (req.query.teacherId) {
  query = query.eq('teacherId', req.query.teacherId);
} else if (user.role === 'teacher') {
  // Professor só vê seus próprios
  query = query.eq('teacherId', user.uid);
} else {
  // Diretor/Admin vê da sua escola
  query = query.eq('school_id', user.school_id);
}

// GET /api/users — filtrar por school_id
if (user.role === 'admin') {
  // Admin vê todos os usuários de todas as escolas
  query = query.order('school_id, displayName');
} else {
  // Diretor vê apenas usuários da sua escola
  query = query.eq('school_id', user.school_id);
}
```

### B. `app.js` — UI por Role e Escola

#### AdminView (novo)
- Painel global com todas as escolas
- Tabela de escolas (criar, editar, deletar)
- Tabela de diretores (criar, promover, deletar)
- Estatísticas globais

#### DiretorView (modificado)
- Dashboard da sua escola (não mudança visual, só dados filtrados)
- Criar professores (apenas student.role=teacher, school_id=minha_escola)
- Visualizar aulas, labs, atestados da sua escola

#### TeacherView (sem mudanças)
- Criar/editar suas aulas
- Reservar labs
- Ver atestados

#### Tela de Login (modificado)
- Após login, usuário só vê dados da sua escola
- Diretor automaticamente filtrado para sua escola

---

## 4. FLUXO DE USO

### 1️⃣ Admin cria primeira escola
```
Admin → "Criar Escola" → Nome: "Escola XYZ" → Cria
```

### 2️⃣ Admin cria diretor da escola
```
Admin → Seleciona "Escola XYZ" → "Adicionar Diretor" → Email diretor → Role: diretor → Cria
```

### 3️⃣ Diretor cria professores
```
Diretor → Aba "Usuários" → "Adicionar Professor" → Email professor → Role: teacher → Cria
(Professores automaticamente associados à escola do diretor)
```

### 4️⃣ Professor cria aulas
```
Professor → Aba "Horários" → "Nova Aula" → Dados → Cria
(Aulas automaticamente associadas à sua escola)
```

---

## 5. IMPLEMENTAÇÃO (Timeline)

### Fase 1: Banco de Dados (2 dias)
- [ ] Criar tabela `schools`
- [ ] Adicionar `school_id` a todas as tabelas
- [ ] Testar migração

### Fase 2: Backend (4 dias)
- [ ] Modificar `POST /api/auth/register` para aceitar `school_id`
- [ ] Modificar todos os `GET /api/*` para filtrar por `school_id`
- [ ] Adicionar novos endpoints:
  - `POST /api/schools` (criar escola)
  - `GET /api/schools` (listar escolas - admin only)
  - `PATCH /api/schools/:id` (editar escola)
  - `DELETE /api/schools/:id` (deletar escola)
- [ ] Middleware de autenticação (validar school_id)

### Fase 3: Frontend (5 dias)
- [ ] AdminView nova: tabela de escolas + diretores
- [ ] Modificar DiretorView: criar professores da sua escola
- [ ] Modificar formulários para incluir seletor de escola (se aplicável)
- [ ] Testar isolamento de dados por escola

### Fase 4: Testes (3 dias)
- [ ] Teste isolamento: diretor A não vê dados de diretor B
- [ ] Teste fluxo completo: admin → diretor → professor
- [ ] Teste permissões: professor não consegue promover alguém
- [ ] Teste de segurança: SQL injection, acesso não autorizado

### Fase 5: Deploy (2 dias)
- [ ] Build de produção
- [ ] Deploy em cloud (Vercel/Railway)
- [ ] Configurar domínio
- [ ] HTTPS
- [ ] Backup automático do banco

---

## 6. BANCO DE DADOS - SQL COMPLETA

```sql
-- Criar tabela schools
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  createdBy UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar school_id às tabelas existentes
ALTER TABLE users ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE schedules ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE lab_bookings ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE certificates ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;

-- Índices
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_schedules_school_id ON schedules(school_id);
CREATE INDEX idx_lab_bookings_school_id ON lab_bookings(school_id);
CREATE INDEX idx_certificates_school_id ON certificates(school_id);

-- Dados de teste
INSERT INTO schools (name, createdBy) VALUES 
  ('Escola Teste', (SELECT uid FROM users WHERE role = 'admin' LIMIT 1))
ON CONFLICT DO NOTHING;

UPDATE users SET school_id = (SELECT id FROM schools LIMIT 1) 
WHERE school_id IS NULL AND role != 'admin';
```

---

## 7. CHECKLIST PRÉ-DEPLOY

- [ ] Todas as tabelas têm `school_id`
- [ ] Todos os endpoints filtram por `school_id` (exceto admin)
- [ ] Diretor não consegue ver dados de outra escola
- [ ] Professor não consegue se promover
- [ ] Admin consegue gerenciar todas as escolas
- [ ] Testes de permissão passam
- [ ] Banco tem backups automáticos
- [ ] Variáveis de ambiente estão corretas
- [ ] HTTPS está ativo
- [ ] Domínio está configurado

---

## 8. PRÓXIMOS PASSOS

1. Você aprova este plano?
2. Começamos pela Fase 1 (banco de dados)?
3. Quer testar no ambiente local antes de fazer deployment?

**Estimativa total:** 16 dias de desenvolvimento + 2 dias de deploy = **~18 dias** (confortável para < 1 mês)
