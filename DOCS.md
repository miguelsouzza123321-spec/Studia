# Studia — Documentação técnica

Documentação baseada no código real do repositório (`src/app.js` e `server.ts`). Onde algo existe no código mas não é usado por nenhuma tela, isso é indicado explicitamente como tal.

## 1. Visão geral da arquitetura

```
Navegador                    Express (server.ts)              Supabase
┌────────────────┐  fetch   ┌───────────────────────┐  SDK   ┌─────────────┐
│ src/app.js      │ ───────▶│ /api/*  (rotas REST)   │ ─────▶ │ Postgres    │
│ (renderiza tudo │◀─────── │ - client "supabase"    │        │ (tabelas)   │
│  via innerHTML) │  JSON   │   (service role key)   │        │ Auth        │
└────────────────┘         │ - client "supabaseAuth" │        └─────────────┘
                            │   (anon key, só login)  │
                            └───────────────────────┘
```

- **Frontend (`src/app.js`)**: uma única SPA vanilla JS sem framework, sem build de componentes e sem roteador de URL. Todo o app vive em memória em variáveis `let` no topo do arquivo (`user`, `schedules`, `teachers`, `allUsers`, `currentTab`, etc.). Cada "tela" é uma função que retorna uma string HTML (`LandingView`, `DeveloperView`, `DiretorView`, `TeacherView`, e abas como `HorariosTab`, `LabsTab`, `UsersTab` e `RelatoriosTab`). `DeveloperView`/`DiretorView`/`TeacherView` compõem sua sidebar e drawer mobile chamando os helpers compartilhados `Sidebar({...})`/`MobileDrawer({...})` em vez de duplicar essa marcação. A função `render(html)` substitui `#app.innerHTML` inteiro a cada mudança de estado.
- **Interação**: não há `addEventListener` delegado nem componentes — os próprios templates têm `onclick="actions.algumaCoisa(...)"` inline, e `window.actions` é exposto globalmente (`window.actions = actions`) para que esses atributos funcionem. Toda ação que muda estado termina chamando `this.init()`, que decide qual view renderizar com base em `user` e `currentTab` e re-renderiza a árvore inteira.
- **Backend (`server.ts`)**: Express expondo rotas `/api/*` que apenas repassam para o Supabase. Existem dois clients Supabase:
  - `supabase` — criado com a **service role key**, usado em quase todas as rotas (acesso administrativo total ao banco e à Auth).
  - `supabaseAuth` — criado com a **anon key**, usado só em `/api/auth/login` para `signInWithPassword`.
- Em desenvolvimento, o Vite roda como middleware do próprio Express (`middlewareMode: true`, `appType: 'spa'`) — um único processo/porta. Em produção (`NODE_ENV=production`), o Express serve os arquivos estáticos de `dist/` com fallback de SPA (`app.get('*', ...)`).
- **Persistência do lado do cliente**: `localStorage` guarda a sessão (`user`, o JSON retornado pelo login/registro), a URL base da API (`api_base_url`) e a preferência de tamanho de card dos relatórios (`reportCardSize`). Não há JWT/token de sessão — o "login" é apenas a linha da tabela `users` devolvida pela API e guardada crua no `localStorage`.

## 2. Funcionalidades por perfil de usuário

Hierarquia (topo → base): `admin` (dono da plataforma) → `diretor` (direção de uma escola) → `teacher` (professor). O perfil (`user.role`) decide qual view é renderizada em `actions.init()`: sem `user` → `LandingView`; `role === 'admin'` → `AdminView`; `role === 'diretor'` → `DiretorView`; qualquer outro (`teacher`) → `TeacherView`.

> **Renomeação 2026-09-10**: o que antes era o cargo `developer` (console técnico à parte) virou o `admin` de topo, com todas as funcionalidades de `diretor` somadas às suas próprias. O que antes era o cargo `admin` (Direção de escola) virou `diretor`, mantendo exatamente as mesmas 5 abas/funcionalidades de antes, só com o nome do cargo trocado. Isso exige uma migração dos valores já gravados em `users.role` no Supabase — ver §9.3 antes de considerar essa renomeação "concluída em produção".

### Admin (`AdminView`) — topo da hierarquia
Sidebar escura, 6 abas (as 5 de `DiretorView` + uma exclusiva):
- **Visão geral**: cartões com contagem de usuários, horários e reservas de laboratório, mais um painel de infraestrutura.
- **Horários**, **Laboratórios**, **Relatórios**: componentes compartilhados com a visão da direção.
- **Usuários** (`UsersTab({ viewerRole: 'admin' })`): único lugar que lista **todas** as contas, incluindo outras contas `admin`; o dropdown de perfil oferece as 3 opções (`teacher`/`diretor`/`admin`) — é o único perfil que pode promover alguém a `admin`.

### Diretor (`DiretorView`) — direção de escola
Sidebar clara, 5 abas:
- **Horários** (`HorariosTab`): tabela com todos os horários cadastrados (todas as turmas/professores), com botões de editar e excluir por linha, e botão "Novo Horário" no header.
- **Laboratórios** (`LabsTab`): agenda escolar com filtros por data, laboratório e professor; reservas sobrepostas são rejeitadas.
- **Usuários** (`UsersTab({ viewerRole: 'diretor' })`): lista diretores e professores (contas `admin` ficam ocultas aqui, só aparecem na visão do admin), com exclusão de conta e — via o dropdown de perfil — alteração de cargo entre `teacher`/`diretor` (nunca `admin`; exceto o próprio usuário logado, que não pode trocar o próprio cargo).
- **Relatórios** (`RelatoriosTab`): geração de grade em PDF (por professor ou por turma) e gráfico de frequência.

### Professor (`TeacherView`)
Sidebar com 3 abas:
- **Meus Horários**: grade semanal só com as aulas do próprio professor (`GET /api/schedules?teacherId=...`), sem edição — só visualização e exportação em PDF individual.
- **Laboratórios**: agenda compartilhada da escola; o professor pode excluir suas próprias reservas.

O cadastro público (`LandingView`) não tem seleção de perfil — todo auto-cadastro cria uma conta `teacher`. Contas `diretor` e `admin` só existem promovendo um usuário já cadastrado via o dropdown de perfil na aba Usuários (ver §9.1 e §5 acima).

## 3. Rotas da API (`server.ts`)

Nenhuma rota valida token/sessão do chamador — a API confia em quem fizer a requisição HTTP; o controle de quem pode ver/clicar o quê é feito só na interface (ver seção 7).

| Rota | O que faz |
|---|---|
| `POST /api/auth/register` | Cria usuário no Supabase Auth (`admin.createUser`) e depois insere a linha correspondente em `users`. Se a inserção falhar, deleta o usuário de Auth para não deixar órfão. `role` vindo do corpo é ignorado — a conta é sempre criada como `teacher` (ver §9.1). |
| `POST /api/auth/login` | Autentica com `supabaseAuth.auth.signInWithPassword`, depois busca a linha em `users` pelo `uid` e devolve esse registro (é o que vira `user` no frontend). |
| `GET /api/schedules` | Lista horários, ordenado por `date` desc e `startTime` asc. Filtra por `?teacherId=`. |
| `POST /api/schedules` | Cria horário com `status: 'pending'`. |
| `PATCH /api/schedules/:id` | Atualiza um horário. Se só `status` vier no corpo, atualiza somente o status; senão substitui todos os campos enviados. |
| `DELETE /api/schedules/:id` | Exclui um horário. |
| `GET /api/stats` | Conta horários por status (`total`, `confirmed`, `absent`, `pending`). |
| `GET /api/teachers` | Lista usuários com `role = 'teacher'`. |
| `GET /api/users` | Lista todos os usuários, ordenado por nome. |
| `DELETE /api/users/:uid` | Remove o usuário do Supabase Auth e da tabela `users`. |
| `PATCH /api/users/:uid/role` | Atualiza o `role` de um usuário (`teacher`/`diretor`/`admin`). |
| `GET /api/labs/bookings` | Lista reservas de laboratório. |
| `POST /api/labs/bookings` | Cria uma reserva (sem checar conflito de horário/sala). |
| `DELETE /api/labs/bookings/:id` | Exclui uma reserva. |
| `DELETE /api/labs/bookings-clear-all` | Removido; reservas são canceladas individualmente. |

O fluxo e as rotas de atestados foram removidos. A tabela `certificates` permanece somente para conservar registros históricos e não é acessada pela aplicação.

## 4. Fluxo de autenticação e cargos

1. **Registro**: o modal de login/registro (`LandingView`) não tem seleção de perfil — todo auto-cadastro é professor. Ao registrar, `POST /api/auth/register` cria o usuário na Auth do Supabase (`email_confirm: true`, sem fluxo de confirmação de e-mail) e a linha em `users` com `role: 'teacher'`.
2. **Login**: `POST /api/auth/login` retorna a linha da tabela `users` (não um token). O frontend guarda esse objeto inteiro em `localStorage.user` e o usa como estado de sessão em todas as telas.
3. **Persistência de sessão**: ao carregar a página, `app.js` lê `localStorage.getItem('user')` direto para a variável `user` — não há verificação de validade/expiração; a "sessão" nunca expira sozinha.
4. **Logout**: `actions.logout()` só limpa `localStorage.user` e zera o estado local; não há chamada ao backend nem revogação de nada no Supabase Auth.
5. **Cargos**: `teacher` (base) → `diretor` → `admin` (topo). O auto-cadastro só cria `teacher`; `diretor` e `admin` só são alcançáveis promovendo uma conta existente pela aba Usuários (`PATCH /api/users/:uid/role`). Quem vê essa ação: um `diretor` só pode promover/rebaixar entre `teacher`/`diretor` (nunca oferece a opção `admin` no dropdown); um `admin` vê as 3 opções. Ninguém pode trocar o próprio cargo (a UI bloqueia). Essa diferenciação de opções é só do lado do cliente — o endpoint em si aceita qualquer valor de `VALID_ROLES` vindo de quem chamar (ver 9.2).
6. **Nenhuma rota da API verifica o cargo do chamador** — a distinção de permissões é inteiramente do lado do cliente (quais botões aparecem em cada view). Ver limitações (seção 8).

## 5. Registros históricos de certificados

A aplicação não oferece envio, consulta ou aprovação de atestados. A tabela `certificates` é mantida apenas para preservar registros antigos; não remover essa tabela ao aplicar a migração de horários.

## 6. Horários e Laboratórios

### Horários
- Só a direção cria/edita/exclui horários (`CreateModal`, `EditModal`, `DeleteConfirmModal`), escolhendo o professor a partir da lista retornada por `/api/teachers`.
- Status possíveis: `pending` (padrão ao criar), `confirmed` e `absent`. A migração 008 converte os registros antigos `vaga` para `confirmed` e remove esse status.
- O professor só visualiza os próprios horários, em formato de grade semanal (`TeacherScheduleCard`) calculada a partir do dia da semana de cada `date` e do `startTime`, ou em lista simples (`teacherSchedulesTab`, embora atualmente só a opção `'grid'` exista de fato na UI).
- A grade tem 3 turnos fixos pré-definidos (`matutino`, `vespertino`, `noturno`) ou detecção automática dos horários usados (`auto`, via `getDetectedSlots`).

### Laboratórios
- Dois tipos fixos, fixos no código (não configuráveis pela UI): `info` (Informática) e `chem` (Química).
- Professores e direção podem reservar `info` (Informática) ou `chem` (Química) para sua escola (`LabModal` → `POST /api/labs/bookings`); o servidor valida data, intervalo e conflitos com reservas do mesmo laboratório.
- A agenda permite filtrar por data, laboratório e professor. Professores podem cancelar as próprias reservas; a direção pode cancelar reservas da escola.

## 7. Variáveis de ambiente (`.env`)

Lidas em `server.ts`; o processo lança erro na inicialização se alguma estiver ausente:

| Variável | Uso |
|---|---|
| `SUPABASE_URL` | URL do projeto Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave privilegiada usada pelo client `supabase` (quase todas as rotas, incluindo operações administrativas de Auth como criar/excluir usuário). Nunca deve ir para o frontend. |
| `SUPABASE_ANON_KEY` | Chave pública usada só pelo client `supabaseAuth`, exclusivamente para `signInWithPassword` no login. |
| `PORT` | Porta do Express (padrão 3000 se ausente). |

Adicionalmente, `vite.config.ts` injeta `process.env.GEMINI_API_KEY` como `define` global, mas essa variável **não é lida em nenhum lugar de `src/app.js`** — é resquício de um scaffold (o pacote `@google/genai` está no `package.json` mas não é importado por nada) e não precisa ser configurada para o app funcionar.

## 8. Decisões técnicas relevantes e limitações conhecidas

- **UI vanilla em vez de React**: apesar de `react`/`@vitejs/plugin-react`/`recharts`/`motion` estarem no `package.json`, nada disso é usado — a interface inteira é `src/app.js` com template strings e `innerHTML`. Qualquer contribuição deve seguir esse padrão em vez de introduzir componentes React soltos.
- **Sem autenticação real na API**: as rotas Express não verificam token/sessão — qualquer requisição HTTP direta a `/api/*` (sem passar pela UI) tem acesso total, incluindo excluir usuários ou aprovar atestados. Toda a "segurança" de papéis hoje é apenas visual (esconder/mostrar botões no frontend).
- **CORS totalmente aberto**: `Access-Control-Allow-Origin: *` em todas as rotas.
- **Dados históricos de certificados**: a tabela continua no banco para preservar registros antigos; o fluxo e os endpoints correspondentes foram removidos.
- **Sem verificação de conflito de horário**: nem em `/api/schedules`, nem em `/api/labs/bookings` há checagem de sobreposição (dois horários/reservas podem coexistir no mesmo horário/sala/lab).
- **"Limpar Tabela" de laboratórios é destrutivo e global**: apaga todas as reservas de todos os professores, e o botão fica visível tanto para admin quanto para professor (não há checagem de `user.role` nessa ação, diferente da exclusão individual de reserva).
- **Sessão sem expiração**: o login não usa token; `localStorage.user` fica válido indefinidamente no navegador até logout manual ou limpeza do storage.
- **`api_base_url` / detecção de ambiente**: em `localhost` a API aponta sempre para `http://localhost:3000`; no próprio host Render, usa a mesma origem; em outros hosts, aponta para `https://studia-8st9.onrender.com`.
- **Código morto**: `SlidesTab` (um carrossel de slides institucionais sobre o Studia) e as actions `nextSlide`/`prevSlide`/estado `currentSlide` existem no arquivo mas não são chamados por nenhuma view atual — não aparecem em lugar nenhum da aplicação.
- **Sem testes e sem lint de código**: não há suíte de testes no repositório; `npm run lint` roda apenas `tsc --noEmit` (checagem de tipos), sem ESLint/Prettier configurados.
- **Schema do banco**: as tabelas são referenciadas por nome direto no `server.ts`; o schema inicial e as migrações SQL ficam neste repositório e devem ser aplicados no Supabase.

## 9. Vulnerabilidades conhecidas

### 9.1 Auto-cadastro como Diretor/admin (crítica) — ✅ corrigida em 2026-09-10

**Status**: corrigida. `POST /api/auth/register` agora ignora completamente qualquer `role` vindo do corpo da requisição e sempre cria a conta como `'teacher'` (`server.ts`, rota `/api/auth/register`); o `<select id="auth-role">` foi removido do modal de cadastro público em `LandingView`, e `actions.register()` não lê nem envia mais `role`. A função `handleRoleChange()`, que só existia para esconder/mostrar o campo de matéria conforme o perfil escolhido, foi removida (órfã — nenhum outro elemento chamava). O campo de matéria (`#auth-subject`) agora é sempre exibido no cadastro, já que todo auto-cadastro é professor. Promoção a `admin`/`developer` continua existindo, mas só via `PATCH /api/users/:uid/role` (usável por uma conta admin/developer já existente) — ver 9.2 para a limitação que ainda cerca essa rota.

O histórico do problema original fica registrado abaixo para referência.

**Resumo (histórico)**: qualquer visitante anônimo podia virar admin ("Diretor") pela própria tela pública de cadastro, sem convite nem aprovação de ninguém.

**Detalhes (histórico)**: `LandingView` renderizava, no modal de "Criar Conta", um `<select id="auth-role">` com as opções `teacher`/`admin` (`src/app.js:753-756`) visível para qualquer usuário não autenticado. `actions.register()` (`src/app.js:2344-2374`) enviava esse `role` como veio do formulário para `POST /api/auth/register`. No backend, `server.ts:38` aceitava esse campo sem checagem de autorização — `const profileRole = role === 'admin' ? 'admin' : 'teacher';` — e criava a conta com `role: 'admin'` de fato. Como nenhuma rota valida token/sessão do chamador (ver seção 8), o mesmo valia batendo direto em `POST /api/auth/register` com `{"role":"admin"}` via HTTP, sem sequer passar pela UI. O resultado era acesso administrativo total (gerenciar horários de todos, excluir usuários, aprovar atestados, limpar reservas de lab) via auto-cadastro.

**Correção aplicada**: `server.ts` passou a ignorar o `role` vindo do corpo da requisição em `/api/auth/register` e a criar a conta sempre como `'teacher'`; promoção a `admin`/`developer` só é possível via `PATCH /api/users/:uid/role` (rota que ainda não verifica se quem chama é admin — ver 9.2). No frontend, o `<select id="auth-role">` foi removido do formulário de cadastro público em `LandingView` (junto com `subject-container`/`handleRoleChange`), deixando o auto-cadastro sempre como professor; o primeiro admin do sistema segue precisando ser criado manualmente (ex.: direto no Supabase ou promovendo uma conta existente já cadastrada como professor).

### 9.2 Nenhuma rota da API verifica o cargo de quem chama

Consequência direta da falta de autenticação descrita na seção 8: mesmo depois de corrigir 9.1, qualquer requisição HTTP direta (sem passar pela UI) a rotas como `PATCH /api/users/:uid/role` ou `DELETE /api/users/:uid` tem sucesso, independente de quem a fez. Uma correção completa exigiria um mecanismo real de sessão (token) e checagem de `role` no servidor antes de cada operação sensível — hoje isso é só uma limitação estrutural do projeto, não coberta pela correção de 9.1.

### 9.3 Renomeação da hierarquia de cargos (2026-09-10) — ⚠️ pendente migração de dados em produção

**Resumo**: `server.ts`/`src/app.js` foram atualizados para o vocabulário `teacher` → `diretor` → `admin` (ver §2). O código está pronto, mas a coluna `users.role` no Supabase ainda guarda os valores antigos (`admin` = direção de escola, `developer` = dono da plataforma) até que a migração abaixo seja executada — **até lá, contas reais de direção continuam com `role = 'admin'` no banco, e o código novo trata `role === 'admin'` como o cargo de topo**. Rodar o código novo contra o banco não migrado é uma escalação de privilégio (diretores existentes passam a ter acesso de admin de topo).

**Migração pendente (rodar no SQL editor do Supabase, feita pelo dono do projeto — não deve ser executada silenciosamente por uma sessão automatizada por tocar dados reais de produção):**
```sql
-- 0) contagem antes
select role, count(*) from users group by role order by role;

-- 1) migração (ordem importa)
begin;
update users set role = 'diretor' where role = 'admin';
update users set role = 'admin'   where role = 'developer';
commit;

-- 2) contagem depois (zero linhas 'developer' esperado)
select role, count(*) from users group by role order by role;
```
Se `role` tiver uma CHECK constraint/enum restringindo valores, o passo 1 falha — checar `select conname, pg_get_constraintdef(oid) from pg_constraint where conrelid='users'::regclass;` e ajustar a constraint antes.

**Assim que a migração rodar**, remover esta seção 9.3 (ou marcá-la como concluída, seguindo o padrão de 9.1) já que o código e os dados estarão alinhados.
