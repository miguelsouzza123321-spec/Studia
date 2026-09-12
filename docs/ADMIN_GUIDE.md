# 👨‍💼 Guia do Admin (Plataforma)

## O que é um Admin?

**Admin** é o proprietário da plataforma Studia. Tem acesso a:
- ✅ Criar/editar/deletar escolas
- ✅ Gerenciar diretores
- ✅ Ver estatísticas globais da plataforma
- ✅ Acessar painel de infraestrutura

Um admin pode gerenciar **múltiplas escolas** simultaneamente.

## Login

1. Abra o site
2. Click em **"Já tenho conta"**
3. Email: seu email admin
4. Senha: sua senha
5. Click **"Entrar"**

Você vê a **AdminView** com:
- Aba **"Visão Geral"** (ativa por padrão)
- Abas de dados: Horários, Laboratórios, Atestados, Usuários, Relatórios

## Aba: Visão Geral

Mostra estatísticas da plataforma:

| Card | Mostra |
|------|--------|
| **Status** | Conexão com API (OK / Offline) |
| **Usuários** | Total de contas no sistema |
| **Horários** | Total de aulas cadastradas |
| **Labs** | Total de reservas de laboratório |

### Infraestrutura

Tabela com informações técnicas:
- Banco de dados: Supabase Postgres
- Autenticação: Auth + RLS
- Hosting: Vercel/Railway
- etc

## Aba: Usuários

### Ver Todos os Usuários

Tabela mostrando:
- Email
- Nome
- Cargo (Admin, Diretor, Professor)
- Escola
- Ações

### Criar Novo Diretor

1. Click botão **"+ Adicionar Diretor"**
2. Preencha:
   - Email: email do diretor
   - Nome: nome completo
   - Escola: selecione ou crie
   - Senha: deixamos gerado ou você defini
3. Click **"Criar"**

O diretor recebe email com credenciais e acessa.

### Editar Cargo

1. Na tabela, encontre o usuário
2. Click no dropdown ao lado do nome
3. Selecione novo cargo:
   - **Admin** → Promove a administrador
   - **Diretor** → Promove a diretor
   - **Professor** → Rebaixa a professor
4. Salva automaticamente

⚠️ **Admin não consegue se rebaixar** — proteção contra ficar sem admin

### Deletar Usuário

1. Click no ícone 🗑️ do usuário
2. Confirma: "Tem certeza?"
3. Usuário deletado (irreversível)

⚠️ **Todas as aulas/labs/atestados desse usuário também são deletados**

## Aba: Horários

Ver **todas** as aulas de **todas** as escolas.

### Editar Aula

1. Encontre a aula na tabela
2. Click em ✏️
3. Edite dados
4. Click **"Salvar"**

### Deletar Aula

1. Click em 🗑️
2. Confirma
3. Aula deletada

## Aba: Laboratórios

Ver **todas** as reservas de laboratório.

### Ver Reservas

Tabela com:
- Laboratório (Informática / Química)
- Professor
- Data e hora
- Status

### Deletar Reserva

1. Click em 🗑️ da reserva
2. Confirma
3. Reserva deletada

⚠️ **"Limpar Tabela"** deleta TODAS as reservas — usar com cuidado

## Aba: Atestados

Ver **todos** os atestados médicos.

### Ver Atestados Pendentes

Filtro no topo mostra:
- Pendente (awaiting aprovação)
- Aprovado (aulas já marcadas como vaga)

### Aprovar Atestado

1. Encontre atestado pendente
2. Click **"Aprovar"**
3. Sistema automaticamente marca as aulas do dia como "Aula Vaga"

### Ver Foto do Atestado

1. Click no atestado
2. Foto anexada abre em modal

## Aba: Relatórios

Gerar relatórios em PDF.

### Filtros

- **Tipo:** Professores / Turmas
- **Semana:** Selecione semana
- **Turno:** Matutino / Vespertino / Noturno
- **Tamanho de card:** Pequeno / Médio / Grande

### Gerar PDF

1. Preencha filtros
2. Click **"Gerar Relatório"**
3. PDF baixa automaticamente

## Tarefas Comuns

### Cenário 1: Adicionar Nova Escola

1. Aba **"Usuários"**
2. Click **"+ Adicionar Diretor"**
3. Em "Escola", selecione **"+ Nova Escola"**
4. Preencha nome da escola
5. Cria e já associa o diretor

### Cenário 2: Transferir Professor para Outra Escola

❌ Não é possível transferir (design atual)

**Solução:** Deletar professor, recreate na outra escola

### Cenário 3: Gerar Relatório de Frequência

1. Aba **"Relatórios"**
2. Tipo: **Professores**
3. Selecione semana
4. Click **"Gerar Relatório"**
5. PDF desce com grade de frequência

### Cenário 4: Aprovar Todos os Atestados

❌ Não há opção de "aprovar em massa"

**Workaround:** Aprovar um por um (há botão para cada)

## Permissões

### Admin consegue:
- ✅ Ver todos os dados de todas as escolas
- ✅ Criar/editar/deletar usuários
- ✅ Criar/editar/deletar escolas
- ✅ Criar/editar/deletar aulas
- ✅ Criar/editar/deletar labs
- ✅ Aprovar atestados
- ✅ Gerar relatórios

### Admin NÃO consegue:
- ❌ Deletar sua própria conta
- ❌ Se rebaixar
- ❌ Alterar permissões de outro admin

## Boas Práticas

1. **Backup antes de grandes mudanças** — Supabase faz automático, mas bom avisar
2. **Testar com conta de test primeiro** — Não mexer em dados reais sem teste
3. **Documentar mudanças** — Se deletar algo importante, registrar motivo
4. **Monitorar uso** — Ver quantas escolas/professores estão usando
5. **Comunicar com diretores** — Se houver downtime, avisar com antecedência

## Suporte & Troubleshooting

### Problema: Diretor não consegue ver seus professores
- [ ] Verifique que professor tem `school_id` da escola do diretor
- [ ] Diretor tem `role='diretor'`?
- [ ] Sugerir refresh F5

### Problema: Aula não aparece na tabela
- [ ] Aula foi criada?
- [ ] Está na escola correta?
- [ ] Sugerir refresh

### Problema: Não consigo criar diretor
- [ ] Email já existe?
- [ ] Escola foi selecionada?
- [ ] Verifique logs do servidor

## Próximos Passos

- Leia [[DIRETOR_GUIDE|Guia do Diretor]]
- Leia [[PROFESSOR_GUIDE|Guia do Professor]]
- Consulte [[ARQUITETURA|Arquitetura]] para entender como funciona
