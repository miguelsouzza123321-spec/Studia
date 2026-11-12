# Studia

Sistema de gestão escolar para organizar horários de aula e reservas de laboratório, com áreas para desenvolvedor, direção pedagógica e professores.

## Funcionalidades principais

- **Horários**: cadastro, edição e exclusão de aulas (matéria, turma, sala, data/horário, professor), com status pendente, confirmado ou ausente.
- **Laboratórios**: reservas de Informática ou Química, agenda compartilhada por escola, filtros por data/laboratório/professor e validação de conflitos.
- **Usuários**: cadastro de contas (professor/direção pedagógica/desenvolvedor), gestão de perfis e exclusão de usuários.
- **Relatórios**: grade de horários em PDF por professor ou por turma, com filtros de semana, turno e tamanho de card, além de um gráfico simples de frequência.
- **Área do desenvolvedor**: reúne a gestão global de escolas e usuários, monitoramento, diagnóstico, logs, auditoria e ferramentas de exportação. Diretores e professores têm acesso limitado à própria escola ou aos próprios dados.

O fluxo de atestados foi removido; a migração não apaga os registros históricos existentes. A migração `008_remove_vacant_status_and_validate_lab_bookings.sql` converte horários antigos com status `vaga` para `confirmed` e restringe os status disponíveis.

## Stack

- **Frontend**: JavaScript puro (`src/app.js`), renderizado via template strings + `innerHTML`, estilizado com Tailwind CSS. (React/Vite plugin estão nas dependências mas não são usados pela UI atual.)
- **Backend**: Express (`server.ts`) como proxy REST para o Supabase.
- **Banco de dados / Auth**: Supabase (Postgres + Auth).
- **Build**: Vite (client) + esbuild (bundle do servidor para produção).

## Como rodar localmente

1. Instale as dependências:
   ```
   npm install
   ```
2. Configure o `.env` na raiz com as credenciais do Supabase:
   ```
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   SUPABASE_ANON_KEY=...
   PORT=3000
   ```
3. Inicie o servidor de desenvolvimento (Express + Vite em modo middleware, tudo em um processo só):
   ```
   npm run dev
   ```
   O app fica disponível em `http://localhost:3000`.

## Outros comandos

| Comando | O que faz |
|---|---|
| `npm run build` | Build do client (Vite) + bundle do servidor (`dist/server.cjs`) |
| `npm start` | Roda o build de produção |
| `npm run preview` | Preview do build do client via Vite |
| `npm run lint` | Checagem de tipos (`tsc --noEmit`) |
| `npm run clean` | Remove `dist/` |

Mais detalhes de arquitetura, rotas e regras de negócio em [DOCS.md](./DOCS.md).
