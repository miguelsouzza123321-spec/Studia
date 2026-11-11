# ⚡ Configuração rápida do desenvolvedor

**Tempo:** 5 minutos  
**Objetivo:** Ter uma conta de desenvolvedor para gerenciar todas as escolas

---

## 🚀 Opção A: Promover uma conta existente

Crie uma conta normalmente como professor e promova-a pelo SQL Editor do Supabase:

```sql
UPDATE users
SET role = 'dev'
WHERE email = 'desenvolvedor@teste.local';
```

Substitua o email pelo da conta cadastrada. Faça logout e login novamente. A conta de desenvolvedor terá acesso às escolas e às funções globais.

---

## Migração de contas antigas

Antes de publicar esta versão, execute `migrations/006_remove_admin_role.sql` no SQL Editor do Supabase. Ela converte as contas antigas de administrador em desenvolvedor e remove o cargo antigo da restrição do banco. Depois, as pessoas afetadas devem sair da conta e entrar novamente para atualizar o cargo salvo na sessão.

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
DEVELOPER TEST ACCOUNT
─────────────────
Email:    desenvolvedor@teste.local
Senha:    [VOCÊ ESCOLHE]
Cargo:    dev
```

---

**Pronto?** Teste e me avisa quando terminar! 🚀
