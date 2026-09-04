#!/bin/sh
set -e

echo "Aguardando base de dados ficar disponível..."
# Pequeno delay de segurança; o healthcheck do docker-compose já garante que o MySQL está pronto,
# mas isto evita falhas em arranques muito rápidos
sleep 3

echo "A aplicar migrações do Prisma..."
npx prisma migrate deploy

echo "A correr o seed (categorias + utilizador ADMIN)..."
npx prisma db seed

echo "A iniciar o servidor..."
exec node src/server.js