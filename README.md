# repositorio-backend

API backend do sistema de gestão documental da empresa — upload, pesquisa, categorização e controlo de permissões de documentos.

## Stack

- **Node.js** (CommonJS)
- **Express.js**
- **Prisma ORM** (MySQL)
- **Express-Validator** / **Zod** (validação)
- **JWT** (autenticação) + cookies httpOnly
- **Bcrypt** (hash de senhas)
- **Multer** (upload de ficheiros)
- **node-cache** (cache em memória)
- **i18n** próprio (pt/en, via `Accept-Language`)
- **Docker** / **Docker Compose**

## Estrutura de papéis (perfis)

- **ADMIN** — acesso total, incluindo categorias sensíveis (RH, Financeiro, Jurídico, etc.), aprovação/rejeição de documentos, gestão de utilizadores.
- **FUNCIONARIO** — pode ver, descarregar e submeter documentos (ficam em estado `PENDENTE` até aprovação); não vê categorias sensíveis.

## Pré-requisitos

- Docker e Docker Compose instalados
- (Para desenvolvimento sem Docker) Node.js 20+ e uma instância MySQL 8

## Variáveis de ambiente

Criar um ficheiro `.env` na raiz do projeto com as seguintes variáveis:

```env
# Base de dados
DB_USER=
DB_PASSWORD=
DB_NAME=repositorio_backend

# Autenticação
JWT_SECRET=

# Frontend (para CORS com cookies httpOnly)
FRONTEND_URL=

# Utilizador ADMIN inicial (seed)
ADMIN_NOME=
ADMIN_EMAIL=
ADMIN_SENHA=
ADMIN_NUMERO=
ADMIN_CARGO=
ADMIN_DEPARTAMENTO=
```

> `DATABASE_URL` **não** é definida diretamente — é construída pelo `docker-compose.yml` a partir de `DB_USER`/`DB_PASSWORD` contra o serviço `db`.

## Como correr com Docker

```bash
docker compose up --build
```

Isto vai:

1. Subir o serviço `db` (MySQL 8)
2. Construir e subir o serviço `api`
3. Correr `prisma migrate deploy` (aplica migrations pendentes)
4. Correr o seed (`node prisma/seed.js`) — insere categorias e garante o utilizador ADMIN
5. Iniciar o servidor na **porta 3000**

Para correr em background:

```bash
docker compose up -d --build
```

Para parar:

```bash
docker compose down
```

Para parar e apagar também os dados da base de dados:

```bash
docker compose down -v
```

## Como correr sem Docker (desenvolvimento)

```bash
npm install
npx prisma migrate deploy
npx prisma db seed
npm start
```

Certifica-te de que tens uma instância MySQL acessível e as variáveis de ambiente configuradas localmente.

## Migrations

```bash
npx prisma migrate dev --name nome_da_migration
```

## Formato de resposta da API

Todas as respostas seguem o formato:

```json
{
  "sucesso": true,
  "mensagem": "",
  "data": {}
}
```

## Notas

- Autenticação via JWT em cookie httpOnly (não localStorage), conforme padrão da empresa.
- CORS restrito a `FRONTEND_URL` com `credentials: true`.
- Idioma das respostas controlado pelo cabeçalho `Accept-Language` (`pt` por defeito, suporta `en`).