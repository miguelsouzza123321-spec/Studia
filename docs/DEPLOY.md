# 🚀 Deploy em Produção (Cloud)

## Visão Geral

Este guia mostra como fazer deploy do Studia em produção usando **Vercel** (recomendado) ou **Railway**.

**Por que cloud?**
- ✅ HTTPS automático
- ✅ Uptime 99.9%
- ✅ Backup automático
- ✅ Escalabilidade
- ✅ Custo baixo (~$5-20/mês)

## Pré-requisitos

- [ ] Repositório GitHub
- [ ] Código commitado (`git push`)
- [ ] Banco Supabase em produção
- [ ] Domínio (opcional, você pode usar domínio da plataforma)

## Opção 1: Deploy em Vercel (Recomendado)

### 1. Conectar Repositório

1. Abra https://vercel.com
2. Click **"New Project"**
3. Selecione seu repositório GitHub
4. Click **"Import"**

### 2. Configurar Variáveis de Ambiente

Na tela de configuração, adicione:

```
SUPABASE_URL = https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...
SUPABASE_ANON_KEY = eyJhbGc...
PORT = 3000
```

### 3. Deploy

Click **"Deploy"**

Vercel vai:
1. Clonar seu repo
2. Rodar `npm install`
3. Rodar `npm run build`
4. Servir em `seu-projeto.vercel.app`

### 4. Configurar Domínio (Opcional)

Se tiver domínio (`studia.sua-escola.com`):

1. Vá para **Settings → Domains**
2. Adicione seu domínio
3. Configure DNS records conforme instruções

Pronto! https://studia.sua-escola.com rodando.

## Opção 2: Deploy em Railway

### 1. Conectar Repositório

1. Abra https://railway.app
2. Click **"New Project"**
3. Click **"Deploy from GitHub"**
4. Selecione seu repositório

### 2. Adicionar Variáveis

1. Vá para **Variables**
2. Adicione:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `PORT=3000`
   - `NODE_ENV=production`

### 3. Deploy

1. Click **"Deploy"**
2. Railway vai servir em `seu-projeto.railway.app`

## Pós-Deploy: Checklist

- [ ] Site abre em `seu-dominio.com`
- [ ] HTTPS está ativo (🔒 em URL)
- [ ] Cadastro funciona
- [ ] Login funciona
- [ ] Admin consegue criar escola
- [ ] Diretor consegue criar professor
- [ ] Professor consegue criar aula
- [ ] Dados estão sendo salvos no banco

## Monitoramento

### Vercel Insights

```
Seu-projeto.vercel.app → Settings → Analytics
```

Vê:
- Requisições por segundo
- Erros
- Performance

### Logs

```
Seu-projeto.vercel.app → Deployments → Click em deploy → View Logs
```

Procure por erros como:
- `Auth error`
- `Database error`
- `ENOENT` (arquivo não encontrado)

### Supabase

1. Dashboard → Seu projeto
2. Vá em **Database → Query Editor**
3. Rode querys para verificar dados

## Atualizações

### Deploy Automático

Toda vez que faz `git push` para `main`:
1. Vercel detecta
2. Faz build automaticamente
3. Deploy acontece em ~2 min

### Deploy Manual

Se quiser redesployed sem fazer commit:

**Vercel:** Settings → Deployments → Redeploy

**Railway:** Click **"Redeploy"** no projeto

## Backup do Banco

### Supabase Automático

Supabase faz backup automático diariamente.

Para ver backups:
1. Seu projeto → **Settings → Backups**
2. Vê histórico de backups

### Restore Manual

Se precisar restaurar:
1. **Settings → Backups**
2. Click em backup
3. Click **"Restore"**

## Rollback

Se algo der errado após deploy:

**Vercel:**
1. Deployments
2. Clique em deploy anterior
3. Click **"Redeploy"**

**Railway:**
1. Deployments
2. Selecione versão anterior
3. Click **"Redeploy"**

## Custos

| Plataforma | Custo | Incluso |
|-----------|-------|----------|
| Vercel | Grátis - $20/mês | 100 GB bandwidth, uptime 99.95% |
| Railway | Grátis - $20/mês | $5/mês credits, pay as you go |
| Supabase | Grátis - $25/mês | 500K queries/mês grátis |

**Total estimado:** $25-50/mês para operação completa

## Troubleshooting

### Erro: "Cannot find module"
- Solução: Rode `npm install` localmente, commit `package-lock.json`

### Erro: "SUPABASE_URL not configured"
- Solução: Verifique variables no painel da plataforma (Vercel/Railway)

### Site lento
- Causa: Muitas requisições ao banco
- Solução: Otimizar queries, adicionar índices

### Deploy falha
- Verifique logs (Deployments → View Logs)
- Procure por erros na build ou em runtime

## Próximos Passos

1. Deploy em staging (branch `staging`)
2. Testar em produção
3. Configurar monitoring
4. Documentar runbooks de operação

## Documentação Oficial

- **Vercel:** https://vercel.com/docs
- **Railway:** https://docs.railway.app
- **Supabase:** https://supabase.com/docs

## Suporte

Para dúvidas:
1. Consulte documentação oficial acima
2. Procure por erro específico
3. Abra issue no repositório
