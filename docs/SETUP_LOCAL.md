# 🛠️ Setup Local - Ambiente de Desenvolvimento

## Pré-requisitos

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **Git**
- **Conta Supabase** (grátis em https://supabase.com)

## 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/studia.git
cd studia
```

## 2. Instalar Dependências

```bash
npm install
```

Isso instala:
- Express (backend)
- Vite (frontend build)
- Supabase (database client)
- Tailwind CSS (styling)
- Lucide Icons (icons)

## 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais Supabase:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...sua-chave-service-role...
SUPABASE_ANON_KEY=eyJhbGc...sua-chave-anon...
PORT=3000
```

### Onde encontrar as credenciais?

1. Abra https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Settings → API**
4. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`
   - **Anon Key** → `SUPABASE_ANON_KEY`

⚠️ **NÃO COMITE `.env` no git!** Já está no `.gitignore`.

## 4. Configurar o Banco de Dados

### Opção A: Executar SQL no Supabase UI

1. Abra seu projeto no Supabase
2. Vá em **SQL Editor**
3. Cole o conteúdo de `schema.sql`
4. Click **RUN**

### Opção B: Usar Supabase CLI

```bash
supabase login
supabase link --project-ref seu-project-id
supabase db push
```

## 5. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Você verá:
```
Server running at http://localhost:3000
```

Abra http://localhost:3000 no navegador.

## 6. Primeira Execução

### 1️⃣ Criar Conta de Admin

1. Clique em **"Não tenho conta"**
2. Preencha:
   - **Nome:** "Administrador"
   - **Matéria:** "Admin" (pode ser qualquer coisa)
   - **Email:** `admin@local.test`
   - **Senha:** algo seguro
3. Click **"Criar Conta"**
4. Você vira professor (padrão)

### 2️⃣ Promover a Admin

Abra o SQL Editor do Supabase e rode:

```sql
update users set role = 'admin' where email = 'admin@local.test';
```

### 3️⃣ Fazer Logout e Login

Agora você vê:
- Aba **"Visão Geral"** (infra, estatísticas)
- 6 abas no total (admin)

## 7. Criar Dados de Teste

### Criar Escola de Teste

```sql
INSERT INTO schools (name, createdBy) VALUES 
  ('Escola Teste', (SELECT uid FROM users WHERE role = 'admin' LIMIT 1));
```

### Criar Diretor de Teste

Faça logout, depois:
1. Click **"Não tenho conta"**
2. Preencha dados diferentes
3. Faça login
4. Execute SQL:

```sql
update users set role = 'diretor', school_id = (SELECT id FROM schools LIMIT 1)
where email = 'seu-email-de-teste@aqui.com';
```

### Criar Professor de Teste

Repita a mesma coisa com role = 'teacher'.

## 8. Estrutura de Pastas

```
studia/
├── src/
│   ├── app.js           # Frontend principal (3200+ linhas)
│   ├── index.css        # Tailwind imports
│   └── index.html       # HTML entry point
├── server.ts            # Backend Express
├── schema.sql           # SQL do banco
├── .env                 # Variáveis de ambiente (NÃO commitar)
├── vite.config.js       # Vite config
├── package.json         # Dependências
└── docs/                # Documentação
```

## 9. Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor + Vite

# Build para produção
npm run build            # Compila tudo
npm start                # Roda production build

# Verificação
npm run lint             # Type-check (tsc --noEmit)

# Limpeza
npm run clean            # Remove dist/
```

## 10. Troubleshooting

### Erro: "User not allowed"
- **Causa:** Chaves Supabase trocadas no `.env`
- **Solução:** Verifique que `SERVICE_ROLE_KEY` tem `"role":"service_role"` no JWT

### Erro: "Cannot find module '@supabase/supabase-js'"
- **Causa:** Dependências não instaladas
- **Solução:** `npm install`

### Erro: "SUPABASE_URL not configured"
- **Causa:** `.env` não foi criado ou falta credenciais
- **Solução:** Crie `.env` com suas credenciais

### Erro: "Port 3000 already in use"
- **Causa:** Outro processo usando porta 3000
- **Solução:** Altere `PORT=3001` em `.env` ou mate o processo

### Site carrega mas sem dados
- **Causa:** Banco não foi configurado (sem tabelas)
- **Solução:** Rode `schema.sql` no Supabase

## 11. IDE Recomendada

- **VS Code** (recomendado)
  - Extensão: **REST Client** (testar APIs)
  - Extensão: **Thunder Client** (alternativa)
  - Extensão: **SQL Formatter**

## 12. Próximos Passos

- Leia [[ARQUITETURA|Arquitetura do Sistema]]
- Estude o [[ADMIN_GUIDE|Guia do Admin]]
- Veja [[API_ROUTES|Rotas da API]] para entender endpoints

## 13. Suporte

Teve problema? Verifique:
1. `.env` tem credenciais corretas?
2. Banco foi criado (`schema.sql` rodou)?
3. Node está na versão correta?
4. Porta 3000 está disponível?

Se ainda não funcionar, abra uma issue no repositório.
