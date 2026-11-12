# 🏗️ Arquitetura do Sistema

## Visão Geral

**Studia** é um sistema de gestão escolar com arquitetura **multi-tenant**, permitindo múltiplas escolas gerenciadas por uma plataforma central.

```
┌─────────────────────────────────────────────────┐
│         DESENVOLVEDOR (Global)                  │
│  • Cria escolas                                 │
│  • Gerencia diretores                           │
│  • Vê estatísticas globais                      │
└──────────────────┬──────────────────────────────┘
         ┌─────────┴──────────┐
         │                    │
    ┌────▼──────────┐   ┌────▼──────────┐
    │ ESCOLA A      │   │ ESCOLA B      │
    │ Diretor: João │   │ Diretor: Maria│
    └────┬──────────┘   └────┬──────────┘
         │                    │
    ┌────┴─────────┐      ┌────┴─────────┐
    │ Professores  │      │ Professores  │
    │ • Prof A1    │      │ • Prof B1    │
    │ • Prof A2    │      │ • Prof B2    │
    └──────────────┘      └──────────────┘
```

## Stack Tecnológico

| Camada | Tecnologia | Detalhes |
|--------|-----------|----------|
| **Frontend** | Vanilla JavaScript (ES6) | 3200+ linhas em `src/app.js` |
| **UI** | Tailwind CSS 4 | Utility-first, OKLCH colors |
| **Icons** | Lucide Icons | SVG via CDN |
| **Backend** | Express.js (Node.js) | REST API, proxy para Supabase |
| **Database** | PostgreSQL (Supabase) | Managed by Supabase |
| **Auth** | Supabase Auth | JWT-based |
| **Build** | Vite (client) + esbuild (server) | Fast, modern tooling |
| **Hosting** | Cloud (Vercel/Railway) | HTTPS, auto-deploy |

## Componentes

### Frontend (`src/app.js`)

**Abordagem:** Template strings + `innerHTML` re-rendering (sem framework)

```javascript
// Estado global
let user = null;           // Usuário logado
let schedules = [];        // Aulas
let labBookings = [];      // Reservas de lab
let teachers = [];         // Professores
let allUsers = [];         // Todos os usuários

// Views (template functions)
const LandingView = () => `...html...`;
const DeveloperView = () => `...html...`;
const DiretorView = () => `...html...`;
const TeacherView = () => `...html...`;

// Actions (event handlers)
const actions = {
  init() { /* bootstrap */ },
  login(email, password) { /* ... */ },
  createSchedule() { /* ... */ },
  // etc
};
```

**Fluxo:**
1. Usuário clica botão → `onclick="actions.method()"`
2. Ação modifica estado (`schedules`, `user`, etc)
3. Ação chama `this.init()` → re-renderiza tudo
4. `render()` sobrescreve `#app.innerHTML`

### Backend (`server.ts`)

**Roteamento:**
```
POST /api/auth/register      → Cria usuário
POST /api/auth/login         → Autentica

GET /api/schedules           → Lista aulas (filtrado por school_id)
POST /api/schedules          → Cria aula
PATCH /api/schedules/:id     → Edita aula
DELETE /api/schedules/:id    → Deleta aula

GET /api/users               → Lista usuários (filtrado por school_id)
PATCH /api/users/:uid/role   → Altera cargo de usuário
DELETE /api/users/:uid       → Deleta usuário

GET /api/labs/bookings       → Lista reservas
POST /api/labs/bookings      → Cria reserva e valida conflitos
DELETE /api/labs/bookings/:id → Deleta reserva

GET /api/schools             → Lista escolas (desenvolvedor only)
POST /api/schools            → Cria escola (desenvolvedor only)
```

**Dois clientes Supabase:**
- `supabase` (service role) — operações privilegiadas
- `supabaseAuth` (anon key) — apenas login

### Banco de Dados

**Tabelas:**
1. `schools` — Escolas (id, name, createdBy, createdAt)
2. `users` — Usuários (uid, email, displayName, role, school_id)
3. `schedules` — Aulas (id, date, subject, teacherId, status, school_id)
4. `lab_bookings` — Reservas (id, labId, teacherId, date, school_id)

`certificates` continua no banco apenas para preservar registros históricos; não há fluxo de produto ou endpoint para atestados.

**Isolamento de Dados:**
- Desenvolvedor: vê tudo (sem filtro)
- Diretor: vê apenas `WHERE school_id = :seu_id`
- Professor: vê apenas seus horários e as reservas de laboratório da própria escola

## Fluxo de Login

```
1. Usuário tela de login → email + senha
2. Frontend: POST /api/auth/login
3. Backend: supabaseAuth.signInWithPassword()
4. Backend: SELECT * FROM users WHERE uid = ...
5. Backend: return usuário + school_id
6. Frontend: localStorage.user = { uid, email, role, school_id, ... }
7. Frontend: render view apropriada (DeveloperView/DiretorView/TeacherView)
```

## Fluxo de Cadastro

```
1. Usuário tela de cadastro (NOVO PROFESSOR) → email, senha, nome, matéria
2. Frontend: POST /api/auth/register { email, password, displayName, subject, school_id, role }
3. Backend: supabase.auth.admin.createUser()
4. Backend: INSERT INTO users (uid, email, displayName, role='teacher', school_id)
5. Frontend: auto-login ou redireciona para login
6. Usuário cria aula → escola identificada por school_id no seu perfil
```

## Isolamento Multi-Tenant

### Regra 1: Cada usuário tem `school_id`
```sql
SELECT * FROM users WHERE uid = 'abc';
-- uid | email | role | school_id
-- abc | prof@x.com | teacher | school-xyz
```

### Regra 2: Cada dado tem `school_id`
```sql
-- Aula criada por Professor da Escola A recebe school_id = 'school-a'
SELECT * FROM schedules WHERE id = 1;
-- id | subject | teacherId | school_id
-- 1  | Math | prof-uuid | school-a
```

### Regra 3: Backend filtra por `school_id` do usuário
```typescript
// GET /api/schedules (Diretor da Escola A pede dados)
if (user.role === 'diretor') {
  query = query.eq('school_id', user.school_id); // Filtra!
}
// Diretor da Escola A nunca vê aulas de Escola B
```

### Regra 4: Desenvolvedor vê tudo (sem filtro)
```typescript
if (user.role === 'dev') {
  // Sem filtro — desenvolvedor vê schedules de TODAS as escolas
}
```

## Segurança

### ✅ Implementado
- JWT auth via Supabase
- Service role key (backend only, nunca no browser)
- Role-based access control (RBAC) — filtragem no servidor
- Isolamento por `school_id`

### ⚠️ A Fazer (Fase 5)
- HTTPS obrigatório
- Rate limiting
- Input validation
- SQL injection prevention (já feito via Supabase prepared statements)
- XSS prevention (escape HTML)

## Fluxo de Dados Típico: Desenvolvedor Cria Diretor

```
1. Desenvolvedor acessa Usuários → "Criar Usuário" → email@diretor.com
2. Frontend: POST /api/auth/register { email, password, role='diretor', school_id='school-xyz' }
3. Backend:
   a) supabase.auth.admin.createUser(email, password) → uid
   b) INSERT INTO users (uid, email, role='diretor', school_id='school-xyz')
4. Sistema envia email com credenciais (TODO)
5. Diretor faz login
6. DiretorView renderiza → vê apenas dados de school-xyz
```

## Performance

**Índices criados:**
- `users(school_id)` — Filtrar usuários por escola
- `schedules(school_id)` — Filtrar aulas por escola
- `schedules(teacherId)` — Filtrar aulas por professor
- `lab_bookings(school_id)` — Filtrar reservas por escola

**Otimizações:**
- Lazy load de dados (só carrega quando entra em aba)
- Cache no `localStorage` (aulas, usuários)
- Índices no banco (queries rápidas)

## Próximos Passos

1. Implementar Fase 1-5 do [[MULTI_TENANT|plano multi-tenant]]
2. Adicionar testes automatizados
3. Melhorar validação de input
4. Adicionar logs de auditoria
