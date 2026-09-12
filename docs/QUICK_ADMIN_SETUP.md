# ⚡ Quick Admin Setup - Pronto para Testar

**Tempo:** 5 minutos  
**Objetivo:** Ter uma conta admin funcionando para testar multi-tenant

---

## 🚀 Opção A: Criação Rápida (Recomendado)

### Passo 1: Fazer Cadastro Normal
1. Abra http://localhost:3000
2. Click **"Não tenho conta"**
3. Preencha:
   - **Nome:** "Administrador"
   - **Matéria:** "Admin"
   - **Email:** `admin@teste.local` (qualquer email)
   - **Senha:** (escolha uma segura)
4. Click **"Criar Conta"**
5. Você vira **Professor** (padrão)

### Passo 2: Promover a Admin no Supabase

1. Abra seu **projeto Supabase** → SQL Editor
2. Cole esta query:
```sql
UPDATE users SET role = 'admin', school_id = (SELECT id FROM schools LIMIT 1)
WHERE email = 'admin@teste.local';
```
3. Click **RUN**

### Passo 3: Fazer Login

1. Faça **Logout** (botão Sair)
2. Click **"Já tenho conta"**
3. Email: `admin@teste.local`
4. Senha: (a que você escolheu)
5. Click **"Entrar"**

✅ **Resultado esperado:** Você vê a aba "Escolas" + 7 abas no total (admin)

---

## 🔑 Opção B: Criar Admin via SQL (Se souber o UID)

Se você quer criar via SQL direto (sem cadastro):

### Passo 1: Descobrir o UID

1. Supabase → **Authentication** → **Users**
2. Procure seu usuário
3. Copie o **UID** (à esquerda do email)

### Passo 2: Rodar SQL

```sql
-- Criar escola
INSERT INTO schools (name, createdBy) VALUES 
  ('Colégio Padrão', NULL)
ON CONFLICT DO NOTHING;

-- Criar user admin
INSERT INTO users (uid, email, displayName, role, school_id) VALUES 
  ('SEU_UID_AQUI', 'admin@teste.local', 'Administrador', 'admin', (SELECT id FROM schools LIMIT 1))
ON CONFLICT (uid) DO NOTHING;
```

**Substitua `SEU_UID_AQUI` pelo UID real**

---

## 📋 Contas de Teste Pré-Criadas

Após setup, você terá:

| Email | Senha | Role | School | Status |
|-------|-------|------|--------|--------|
| `admin@teste.local` | Você escolhe | Admin | Colégio Padrão | ✅ Pronto |

---

## ✅ Verificar se Funcionou

Faça login e verifique:

1. **Aba "Escolas"** aparece? ✅
2. **Título da página:** "Console Studia" ✅
3. **7 abas no total:**
   - Visão geral
   - Escolas ← nova
   - Horários
   - Laboratórios
   - Atestados
   - Usuários
   - Relatórios

Se tudo aparecer, multi-tenant está funcionando! 🎉

---

## 🧪 Próximos Passos

1. ✅ Confirme que login funciona
2. ✅ Abra `docs/TEST_PLAN.md`
3. ✅ Siga as fases de teste
4. ✅ Quando terminar, me avisa para fazer deploy

---

## 🐛 Troubleshooting

### "Aba Escolas não aparece"
- Verifique no DevTools → Console
- Erro? Avise-me
- Limpe cache (Ctrl+Shift+Del) e recarregue

### "Login diz 'Credenciais inválidas'"
- Email/senha estão certos?
- Está usando o email que cadastrou?
- Tente cadastro normal novamente

### "Não consigo deletar a escola"
- Verifique se não tem professores associados
- SQL: `SELECT * FROM users WHERE school_id = 'seu-school-id';`
- Se tiver usuários, delete eles primeiro OU
- Usar cascade (já está configurado)

---

## 📝 Credenciais para Testar (Salve em Lugar Seguro)

```
ADMIN TEST ACCOUNT
─────────────────
Email:    admin@teste.local
Senha:    [VOCÊ ESCOLHE]
Role:     admin
School:   Colégio Padrão
```

---

**Pronto?** Teste e me avisa quando terminar! 🚀
