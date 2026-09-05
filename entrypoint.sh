#!/bin/sh
set -e

echo "Aguardando base de dados ficar disponível..."
sleep 3

echo "A garantir que as pastas de upload existem..."
mkdir -p uploads/avatars uploads/documentos

echo "A aplicar migrações do Prisma..."
npx prisma migrate deploy

echo "A correr o seed (categorias + utilizador ADMIN)..."
npx prisma db seed

echo "A iniciar o servidor..."
exec node src/server.js