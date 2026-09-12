# 📅 Timeline - Plano Executivo Multi-Tenant

**Data Início:** 2026-09-12  
**Data Fim Esperada:** 2026-09-30 (~18 dias)  
**Prazo Total:** < 1 mês ✅

---

## 🎯 Fases

### ✅ FASE 1: Banco de Dados (2 dias) — INICIANDO AGORA
**Status:** Em andamento  
**O que fazer:**
- [ ] Criar tabela `schools` (id, name, createdBy, createdAt)
- [ ] Adicionar `school_id UUID` a: users, schedules, lab_bookings, certificates
- [ ] Criar índices para performance
- [ ] Testar queries por school_id

**Entregáveis:**
- `schools` table criada no Supabase
- Todos os FK funcionando
- Queries testadas

---

### 📋 FASE 2: Backend (4 dias) — Próxima
**O que fazer:**
- [ ] Modificar `POST /api/auth/register` para aceitar `school_id`
- [ ] Modificar `GET /api/*` para filtrar por `school_id`
- [ ] Adicionar endpoints:
  - `POST /api/schools` (criar)
  - `GET /api/schools` (listar - admin)
  - `PATCH /api/schools/:id` (editar)
  - `DELETE /api/schools/:id` (deletar)
- [ ] Testar isolamento (diretor A não vê diretor B)

**Entregáveis:**
- API funcionando com `school_id`
- Filtros aplicados
- Testes passando

---

### 🎨 FASE 3: Frontend (5 dias)
**O que fazer:**
- [ ] Nova tela AdminView: gerenciar escolas
- [ ] Nova tabela AdminView: liretores
- [ ] Modificar DiretorView: criar professores
- [ ] Testar permissões por role

**Entregáveis:**
- Admin consegue criar escolas
- Admin consegue promover diretor
- Diretor consegue criar professor

---

### 🧪 FASE 4: Testes (3 dias)
**O que fazer:**
- [ ] Teste isolamento: diretor A não vê escolas de diretor B
- [ ] Teste fluxo: admin → diretor → professor
- [ ] Teste permissões: professor não consegue deletar aula de outro
- [ ] Teste edge cases: deletar escola com professores

**Entregáveis:**
- Checklist de testes completo
- 0 bugs críticos

---

### 🚀 FASE 5: Deploy (2 dias)
**O que fazer:**
- [ ] Build de produção: `npm run build`
- [ ] Setup Vercel/Railway
- [ ] Variáveis de ambiente
- [ ] HTTPS funcionando
- [ ] Domínio configurado

**Entregáveis:**
- Site em produção: `studia.seu-dominio.com`
- HTTPS ativo 🔒
- Backup automático ativado

---

## 📊 Progresso

```
FASE 1: ██████░░░░░░░░░░░░ 30% (HOJE)
FASE 2: ░░░░░░░░░░░░░░░░░░░  0%
FASE 3: ░░░░░░░░░░░░░░░░░░░  0%
FASE 4: ░░░░░░░░░░░░░░░░░░░  0%
FASE 5: ░░░░░░░░░░░░░░░░░░░  0%

Total: ~5% ███░░░░░░░░░░░░░░░░
```

---

## 📝 Checklist de Entrega

- [ ] Fase 1: SQL executado, tabelas criadas
- [ ] Fase 2: Backend filtrando por school_id
- [ ] Fase 3: Admin consegue gerenciar tudo
- [ ] Fase 4: Todos os testes passam
- [ ] Fase 5: Produção online
- [ ] Documentação atualizada
- [ ] Demo com cliente

---

## 🔄 Próximo Passo

**AGORA:** Começar Fase 1 (Banco de Dados)

Vou rodar a SQL no Supabase:
1. Criar tabela `schools`
2. Adicionar `school_id` a todas as tabelas
3. Criar índices
4. Validar estrutura

**ETA:** ~1 hora
