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

- **Frontend (`src/app.js`, ~3200 linhas)**: uma única SPA vanilla JS sem framework, sem build de componentes e sem roteador de URL. Todo o app vive em memória em variáveis `let` no topo do arquivo (`user`, `schedules`, `teachers`, `allUsers`, `currentTab`, etc.). Cada "tela" é uma função que retorna uma string HTML (`LandingView`, `AdminView`, `DiretorView`, `TeacherView`, e as abas `HorariosTab`, `LabsTab`, `AtestadosTab`, `UsersTab`, `RelatoriosTab`). `AdminView`/`DiretorView`/`TeacherView` compõem sua sidebar e drawer mobile chamando os helpers compartilhados `Sidebar({...})`/`MobileDrawer({...})` (parametrizados por `theme: 'light'|'dark'`, lista de abas e rótulo de seção) em vez de duplicar essa marcação em cada view. A função `render(html)` substitui `#app.innerHTML` inteiro a cada mudança de estado.
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
- **Visão geral** (`AdminOverviewTab`): cartões com contagem de usuários, horários, reservas de lab e atestados, mais um painel de "infraestrutura" (nomes fixos: Supabase Postgres, Auth + RLS, Express + Vite) e a `apiBaseUrl` atual.
- **Horários**, **Laboratórios**, **Atestados**, **Relatórios**: mesmo componente/comportamento descrito em `DiretorView` abaixo (`HorariosTab`, `LabsTab`, `AtestadosTab`, `RelatoriosTab` são reaproveitados, não duplicados).
- **Usuários** (`UsersTab({ viewerRole: 'admin' })`): único lugar que lista **todas** as contas, incluindo outras contas `admin`; o dropdown de perfil oferece as 3 opções (`teacher`/`diretor`/`admin`) — é o único perfil que pode promover alguém a `admin`.

### Diretor (`DiretorView`) — direção de escola
Sidebar clara, 5 abas:
- **Horários** (`HorariosTab`): tabela com todos os horários cadastrados (todas as turmas/professores), com botões de editar e excluir por linha, e botão "Novo Horário" no header.
- **Laboratórios** (`LabsTab`): igual à visão do professor, mas com botão "Limpar Tabela" que apaga *todas* as reservas de todos os professores.
- **Atestados** (`AtestadosTab`): lista todos os atestados de todos os professores, com botão "Aprovar e Gerar Aula Vaga" nos pendentes.
- **Usuários** (`UsersTab({ viewerRole: 'diretor' })`): lista diretores e professores (contas `admin` ficam ocultas aqui, só aparecem na visão do admin), com exclusão de conta e — via o dropdown de perfil — alteração de cargo entre `teacher`/`diretor` (nunca `admin`; exceto o próprio usuário logado, que não pode trocar o próprio cargo).
- **Relatórios** (`RelatoriosTab`): geração de grade em PDF (por professor ou por turma) e gráfico de frequência.

### Professor (`TeacherView`)
Sidebar com 3 abas:
- **Meus Horários**: grade semanal só com as aulas do próprio professor (`GET /api/schedules?teacherId=...`), sem edição — só visualização e exportação em PDF individual.
- **Laboratórios**: mesma tela de reserva dos labs que admin/diretor veem; qualquer professor também pode excluir sua própria reserva e (sem restrição no código) também tem acesso ao botão "Limpar Tabela" completo.
- **Meus Atestados**: lista os próprios atestados enviados e permite enviar um novo (data, motivo, foto opcional).

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
| `DELETE /api/labs/bookings-clear-all` | Apaga **todas** as reservas de laboratório. |
| `GET /api/certificates` | Lista atestados (sem a coluna `imageUrl`, por performance). |
| `GET /api/certificates/:id/image` | Retorna só o `imageUrl` de um atestado específico. |
| `POST /api/certificates` | Cria um atestado (`status` fica implícito/pendente por padrão do banco). |
| `PATCH /api/certificates/:id/approve` | Marca o atestado como `approved` e, em seguida, atualiza todos os horários do mesmo `teacherId` + `date` para `status: 'vaga'`. |

## 4. Fluxo de autenticação e cargos

1. **Registro**: o modal de login/registro (`LandingView`) não tem seleção de perfil — todo auto-cadastro é professor. Ao registrar, `POST /api/auth/register` cria o usuário na Auth do Supabase (`email_confirm: true`, sem fluxo de confirmação de e-mail) e a linha em `users` com `role: 'teacher'`.
2. **Login**: `POST /api/auth/login` retorna a linha da tabela `users` (não um token). O frontend guarda esse objeto inteiro em `localStorage.user` e o usa como estado de sessão em todas as telas.
3. **Persistência de sessão**: ao carregar a página, `app.js` lê `localStorage.getItem('user')` direto para a variável `user` — não há verificação de validade/expiração; a "sessão" nunca expira sozinha.
4. **Logout**: `actions.logout()` só limpa `localStorage.user` e zera o estado local; não há chamada ao backend nem revogação de nada no Supabase Auth.
5. **Cargos**: `teacher` (base) → `diretor` → `admin` (topo). O auto-cadastro só cria `teacher`; `diretor` e `admin` só são alcançáveis promovendo uma conta existente pela aba Usuários (`PATCH /api/users/:uid/role`). Quem vê essa ação: um `diretor` só pode promover/rebaixar entre `teacher`/`diretor` (nunca oferece a opção `admin` no dropdown); um `admin` vê as 3 opções. Ninguém pode trocar o próprio cargo (a UI bloqueia). Essa diferenciação de opções é só do lado do cliente — o endpoint em si aceita qualquer valor de `VALID_ROLES` vindo de quem chamar (ver 9.2).
6. **Nenhuma rota da API verifica o cargo do chamador** — a distinção de permissões é inteiramente do lado do cliente (quais botões aparecem em cada view). Ver limitações (seção 8).

## 5. Atestados (envio, aprovação, homologação)

- Professor abre o modal "Incluir Atestado Médico" (`CertModal`), preenche data da falta, motivo, e opcionalmente anexa uma foto.
- A foto é lida no navegador com `FileReader.readAsDataURL` e enviada como uma string base64 (`imageUrl`) dentro do JSON do `POST /api/certificates` — não há upload para um bucket de storage; a imagem inteira fica guardada na coluna `imageUrl` da tabela `certificates`. O limite de corpo do Express é 10MB (`express.json({ limit: '10mb' })`), o que limita indiretamente o tamanho da foto.
- O atestado nasce com status pendente (não enviado explicitamente pelo frontend — depende do default da coluna no Supabase).
- Direção vê a lista completa em Atestados (`AtestadosTab`) e, para os pendentes, tem o botão "Aprovar e Gerar Aula Vaga".
- Ao aprovar (`PATCH /api/certificates/:id/approve`): o status do certificado vira `approved` **e**, na mesma requisição, todos os horários daquele professor (`teacherId`) na mesma data (`date`) viram `status: 'vaga'` — isso é o que a UI chama de "homologação": aprovar o atestado converte automaticamente as aulas do dia em "aula vaga".
- Visualização da imagem: tanto professor quanto direção podem clicar em "Visualizar Foto"/ícone de olho, que busca `GET /api/certificates/:id/image` (rota separada, porque a listagem geral não traz a imagem) e abre um modal de imagem genérico (`actions.viewImage`).

## 6. Horários e Laboratórios

### Horários
- Só a direção cria/edita/exclui horários (`CreateModal`, `EditModal`, `DeleteConfirmModal`), escolhendo o professor a partir da lista retornada por `/api/teachers`.
- Status possíveis: `pending` (padrão ao criar), `confirmed`, `absent`, `vaga` (definido manualmente pela direção ou automaticamente pela aprovação de atestado).
- O professor só visualiza os próprios horários, em formato de grade semanal (`TeacherScheduleCard`) calculada a partir do dia da semana de cada `date` e do `startTime`, ou em lista simples (`teacherSchedulesTab`, embora atualmente só a opção `'grid'` exista de fato na UI).
- A grade tem 3 turnos fixos pré-definidos (`matutino`, `vespertino`, `noturno`) ou detecção automática dos horários usados (`auto`, via `getDetectedSlots`).

### Laboratórios
- Dois tipos fixos, fixos no código (não configuráveis pela UI): `info` (Informática) e `chem` (Química).
- Qualquer usuário autenticado (admin, diretor ou professor) pode reservar um horário em um dos labs (`LabModal` → `POST /api/labs/bookings`), sem nenhuma checagem de conflito com reservas já existentes na mesma data/horário.
- Exclusão de uma reserva: o dono da reserva, um admin ou um diretor pode excluir (checado no frontend: `user.role === 'admin' || user.role === 'diretor' || b.teacherId === user.uid`).
- "Limpar Tabela" apaga todas as reservas de uma vez (`DELETE /api/labs/bookings-clear-all`) — o botão aparece sempre que há reservas, para qualquer usuário logado que acesse a aba (ver limitações).

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
- **Imagens de atestado em base64 direto no Postgres**: sem bucket de storage, a imagem inteira vira texto na coluna `imageUrl`; isso infla o tamanho das linhas e das respostas de `GET /api/certificates/:id/image`, e é limitado pelo `express.json({ limit: '10mb' })`.
- **Sem verificação de conflito de horário**: nem em `/api/schedules`, nem em `/api/labs/bookings` há checagem de sobreposição (dois horários/reservas podem coexistir no mesmo horário/sala/lab).
- **"Limpar Tabela" de laboratórios é destrutivo e global**: apaga todas as reservas de todos os professores, e o botão fica visível tanto para admin quanto para professor (não há checagem de `user.role` nessa ação, diferente da exclusão individual de reserva).
- **Sessão sem expiração**: o login não usa token; `localStorage.user` fica válido indefinidamente no navegador até logout manual ou limpeza do storage.
- **`api_base_url` / detecção de ambiente**: em `localhost` a API aponta sempre para `http://localhost:3000`; em qualquer outro host "estático" (ex. GitHub Pages), o frontend aponta automaticamente para uma API já publicada no Railway (`studia-production-3255.up.railway.app`), com uma lógica de fallback entre URLs `ais-pre-`/`ais-dev-` que parece herdada de um ambiente de hospedagem diferente (Cloud Run) e não se aplica ao Railway.
- **Código morto**: `SlidesTab` (um carrossel de slides institucionais sobre o Studia) e as actions `nextSlide`/`prevSlide`/estado `currentSlide` existem no arquivo mas não são chamados por nenhuma view atual — não aparecem em lugar nenhum da aplicação.
- **Sem testes e sem lint de código**: não há suíte de testes no repositório; `npm run lint` roda apenas `tsc --noEmit` (checagem de tipos), sem ESLint/Prettier configurados.
- **Sem migrations**: as tabelas `users`, `schedules`, `lab_bookings`, `certificates` são referenciadas por nome direto no `server.ts`; o schema do banco vive só no painel do Supabase, não há arquivos de migração neste repositório.

## 9. Vulnerabilidades conhecidas

### 9.1 Auto-cadastro como Diretor/admin (crítica) — ✅ corrigida em 2026-09-10

**Status**: corrigida. `POST /api/auth/register` agora ignora completamente qualquer `role` vindo do corpo da requisição e sempre cria a conta como `'teacher'` (`server.ts`, rota `/api/auth/register`); o `<select id="auth-role">` foi removido do modal de cadastro público em `LandingView`, e `actions.register()` não lê nem envia mais `role`. A função `handleRoleChange()`, que só existia para esconder/mostrar o campo de matéria conforme o perfil escolhido, foi removida (órfã — nenhum outro elemento chamava). O campo de matéria (`#auth-subject`) agora é sempre exibido no cadastro, já que todo auto-cadastro é professor. Promoção a `admin`/`developer` continua existindo, mas só via `PATCH /api/users/:uid/role` (usável por uma conta admin/developer já existente) — ver 9.2 para a limitação que ainda cerca essa rota.

O histórico do problema original fica registrado abaixo para referência.

**Resumo (histórico)**: qualquer visitante anônimo podia virar admin ("Diretor") pela própria tela pública de cadastro, sem convite nem aprovação de ninguém.

**Detalhes (histórico)**: `LandingView` renderizava, no modal de "Criar Conta", um `<select id="auth-role">` com as opções `teacher`/`admin` (`src/app.js:753-756`) visível para qualquer usuário não autenticado. `actions.register()` (`src/app.js:2344-2374`) enviava esse `role` como veio do formulário para `POST /api/auth/register`. No backend, `server.ts:38` aceitava esse campo sem checagem de autorização — `const profileRole = role === 'admin' ? 'admin' : 'teacher';` — e criava a conta com `role: 'admin'` de fato. Como nenhuma rota valida token/sessão do chamador (ver seção 8), o mesmo valia batendo direto em `POST /api/auth/register` com `{"role":"admin"}` via HTTP, sem sequer passar pela UI. O resultado era acesso administrativo total (gerenciar horários de todos, excluir usuários, aprovar atestados, limpar reservas de lab) via auto-cadastro.

**Correção aplicada**: `server.ts` passou a ignorar o `role` vindo do corpo da requisição em `/api/auth/register` e a criar a conta sempre como `'teacher'`; promoção a `admin`/`developer` só é possível via `PATCH /api/users/:uid/role` (rota que ainda não verifica se quem chama é admin — ver 9.2). No frontend, o `<select id="auth-role">` foi removido do formulário de cadastro público em `LandingView` (junto com `subject-container`/`handleRoleChange`), deixando o auto-cadastro sempre como professor; o primeiro admin do sistema segue precisando ser criado manualmente (ex.: direto no Supabase ou promovendo uma conta existente já cadastrada como professor).

### 9.2 Nenhuma rota da API verifica o cargo de quem chama

Consequência direta da falta de autenticação descrita na seção 8: mesmo depois de corrigir 9.1, qualquer requisição HTTP direta (sem passar pela UI) a rotas como `PATCH /api/users/:uid/role`, `DELETE /api/users/:uid` ou `PATCH /api/certificates/:id/approve` tem sucesso, independente de quem a fez. Uma correção completa exigiria um mecanismo real de sessão (token) e checagem de `role` no servidor antes de cada operação sensível — hoje isso é só uma limitação estrutural do projeto, não coberta pela correção de 9.1.

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
