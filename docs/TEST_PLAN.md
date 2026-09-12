# 🧪 Plano de Testes - Studia Multi-Tenant

**Criado em:** 2026-09-12  
**Status:** Pronto para execução  
**Tempo estimado:** ~4 horas de testes manuais

---

## 📋 Checklist de Teste

### FASE 1: Setup Inicial

- [ ] **1.1** Banco de dados criado (tabela schools + school_id nas tables)
- [ ] **1.2** Servidor rodando (`npm run dev`) em http://localhost:3000
- [ ] **1.3** Landing page carrega sem erros
- [ ] **1.4** Lint passa (`npm run lint`)

---

### FASE 2: Fluxo de Autenticação

#### Criar Contas de Teste

- [ ] **2.1** Cadastrar **Admin de Teste**
  - Email: `admin@test.local`
  - Nome: "Admin Teste"
  - Matéria: "Administração"
  - Resultado: Conta criada como professor (padrão)

- [ ] **2.2** Promover à Admin (SQL):
  ```sql
  UPDATE users SET role = 'admin' WHERE email = 'admin@test.local';
  ```

- [ ] **2.3** Cadastrar **Diretor de Teste A**
  - Email: `diretor-a@test.local`
  - Nome: "Diretor Escola A"
  - Matéria: "Direção"
  - Resultado: Conta criada como professor

- [ ] **2.4** Cadastrar **Diretor de Teste B**
  - Email: `diretor-b@test.local`
  - Nome: "Diretor Escola B"
  - Matéria: "Direção"

- [ ] **2.5** Cadastrar **Professor de Teste A1**
  - Email: `prof-a1@test.local`
  - Nome: "Professor A1"
  - Matéria: "Português"

- [ ] **2.6** Cadastrar **Professor de Teste B1**
  - Email: `prof-b1@test.local`
  - Nome: "Professor B1"
  - Matéria: "Matemática"

---

### FASE 3: Admin - Criar Escolas

**Login como:** `admin@test.local` / sua senha

- [ ] **3.1** Acessar aba "Escolas"
  - Resultado: Tabela vazia ou com escolas existentes

- [ ] **3.2** Click "Nova Escola"
  - Modal abre

- [ ] **3.3** Criar "Escola A"
  - Nome: "Escola A"
  - Click "Criar"
  - Resultado: Escola aparece na tabela

- [ ] **3.4** Criar "Escola B"
  - Nome: "Escola B"
  - Click "Criar"
  - Resultado: Duas escolas na tabela

---

### FASE 4: Admin - Promover Diretores

**Ainda logado como Admin**

- [ ] **4.1** Ir para aba "Usuários"
  - Ver lista de usuários com filtro para não-admins

- [ ] **4.2** Encontrar "Diretor Escola A" (diretor-a@test.local)
  - Click dropdown de cargo
  - Selecionar "Diretor"
  - SQL (se frontend não funcionar):
    ```sql
    UPDATE users SET role = 'diretor', school_id = (
      SELECT id FROM schools WHERE name = 'Escola A' LIMIT 1
    ) WHERE email = 'diretor-a@test.local';
    ```

- [ ] **4.3** Promover "Diretor Escola B"
  - Role → "Diretor"
  - School_id → Escola B
  - SQL (alternativa):
    ```sql
    UPDATE users SET role = 'diretor', school_id = (
      SELECT id FROM schools WHERE name = 'Escola B' LIMIT 1
    ) WHERE email = 'diretor-b@test.local';
    ```

- [ ] **4.4** Verificar que "Admin de Teste" **não pode se rebaixar**
  - Tentar clicar no próprio dropdown
  - Resultado: Desabilitado ou não aparece

---

### FASE 5: Isolamento - Diretor A não vê Diretor B

**Login como:** `diretor-a@test.local` / sua senha

- [ ] **5.1** Acessar aba "Usuários"
  - Resultado: Vê apenas professor-a1, não vê professor-b1 ou diretor-b

- [ ] **5.2** Criar Professor para Escola A
  - Promover professor-a1 para "Diretor"? Não, deixar como Professor
  - Resultado: Professor A1 aparece na lista com role "Professor"

- [ ] **5.3** Tentar acessar dados de Escola B
  - Fazer logout
  - Login como `diretor-b@test.local`
  - Ver que tem sua própria lista de usuários
  - Não vê professor-a1

**Resultado Esperado:** Diretor A vê **APENAS** dados de Escola A

---

### FASE 6: Professor - Acesso Restrito

**Login como:** `prof-a1@test.local` / sua senha

- [ ] **6.1** Verificar abas acessíveis
  - Resultado: Vê apenas 3 abas (horarios, labs, atestados)
  - NÃO vê: usuários, relatórios, escolas

- [ ] **6.2** Tentar acessar "/api/users" diretamente (teste de segurança)
  - Abrir DevTools → Network
  - Request manual: `fetch('/api/users')`
  - Resultado: Vê lista vazia ou apenas seus dados

- [ ] **6.3** Tentar promover outro usuário
  - Não consegue (UI bloqueado)
  - Resultado: Sem opção de dropdown ou botão desabilitado

---

### FASE 7: Operações CRUD

#### Admin - Criar e Deletar

**Login como Admin**

- [ ] **7.1** Criar "Escola C"
  - Nome: "Escola C"
  - Resultado: Adicionada à lista

- [ ] **7.2** Deletar "Escola C"
  - Click ícone lixeira
  - Confirmar
  - Resultado: Removida da lista

- [ ] **7.3** Tentar deletar escola com professores associados
  - Criar Escola D
  - Associar professor a ela (SQL):
    ```sql
    UPDATE users SET school_id = (
      SELECT id FROM schools WHERE name = 'Escola D' LIMIT 1
    ) WHERE email = 'prof-test@test.local';
    ```
  - Tentar deletar Escola D
  - Resultado: Comportamento esperado (erro ou delete em cascata - verificar regra)

---

### FASE 8: Edge Cases

#### Multi-Tenant Isolation

- [ ] **8.1** Diretor A tenta ver relatório de Escola B
  - Login como diretor-a
  - Ir aba "Relatórios"
  - Filtrar por Escola B? (se UI permite)
  - Resultado: Erro ou dados vazios, nunca dados de B

- [ ] **8.2** Horários não se misturam entre escolas
  - Admin cria aula em Escola A
  - Diretor A vê aula
  - Diretor B não vê aula
  - Professor A1 vê sua própria aula

- [ ] **8.3** Atestados isolados por escola
  - Professor A envia atestado
  - Diretor A vê atestado
  - Diretor B não vê atestado

#### Permissões

- [ ] **8.4** Professor não consegue promover ninguém
  - Login como professor
  - Ir aba "Usuários" (se acessível)
  - Resultado: Sem dropdown ou bloqueado

- [ ] **8.5** Diretor não consegue criar outro Diretor
  - Login como diretor
  - Tentar promover professor para diretor
  - Resultado: Bloqueado (só admin consegue)

---

### FASE 9: Fluxo End-to-End

#### Cenário Completo

**Passos:**
1. Admin cria 2 escolas
2. Admin promove 2 diretores (um para cada escola)
3. Cada diretor cria/promove 2 professores
4. Cada professor cria aulas em sua escola
5. Verificar isolamento de dados

**Checklist:**
- [ ] **9.1** Admin vê TODOS os dados de ambas as escolas
- [ ] **9.2** Diretor A vê APENAS dados de Escola A
- [ ] **9.3** Diretor B vê APENAS dados de Escola B
- [ ] **9.4** Professor A1 vê APENAS suas aulas
- [ ] **9.5** Professor B1 vê APENAS suas aulas
- [ ] **9.6** Cruzamento de dados = 0 (isolamento perfeito)

---

### FASE 10: Performance & Stress

- [ ] **10.1** Criar 10 escolas
  - Resultado: Interface rápida, sem lag

- [ ] **10.2** Criar 50 usuários
  - Resultado: Carregamento < 2s

- [ ] **10.3** Criar 100 aulas
  - Resultado: Tabela rola suavemente

---

### FASE 11: Erros Esperados

- [ ] **11.1** Tentar criar escola sem nome
  - Resultado: Erro "Nome obrigatório" ou similar

- [ ] **11.2** Deletar usuário e suas aulas são deletadas
  - Criar professor
  - Criar aula do professor
  - Deletar professor
  - Resultado: Aulas também deletadas (cascade)

- [ ] **11.3** Desconectar e reconectar mantém dados
  - Login
  - Fechar browser
  - Reabrir e fazer login
  - Resultado: Dados mantêm (localStorage + backend)

---

## 🐛 Bugs Encontrados

Use este espaço para documentar bugs durante teste:

### Bug #1
- **Descrição:** [O que não funciona?]
- **Passos para reproduzir:** 
- **Resultado esperado:** 
- **Resultado obtido:** 
- **Crítico?** Sim / Não

### Bug #2
[Similar ao anterior]

---

## ✅ Resultados Finais

| Categoria | Status | Notas |
|-----------|--------|-------|
| Auth & Login | ✅ / ⚠️ / ❌ | |
| Escolas (CRUD) | ✅ / ⚠️ / ❌ | |
| Isolamento | ✅ / ⚠️ / ❌ | |
| Permissões | ✅ / ⚠️ / ❌ | |
| Fluxo E2E | ✅ / ⚠️ / ❌ | |
| Performance | ✅ / ⚠️ / ❌ | |

---

## 📝 Assinatura

- **Testado por:** [Seu nome]
- **Data:** [Data do teste]
- **Resultado:** ✅ Pronto para produção / ⚠️ Ajustes necessários / ❌ Bloqueado

---

## Próximos Passos

Após completar todos os testes:
1. ✅ Documentar qualquer bug encontrado acima
2. ✅ Corrigir bugs críticos
3. ✅ Rodar testes novamente
4. ✅ Assinar aprovação final
5. ✅ Ir para Fase 5: Deploy
