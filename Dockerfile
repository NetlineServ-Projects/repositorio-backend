FROM node:20-slim

# Dependências de sistema mínimas (openssl é necessário para o Prisma engine)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instala dependências primeiro (aproveita cache do Docker enquanto o código muda)
COPY package.json package-lock.json ./
RUN npm ci

# Copia o resto do código, incluindo prisma/schema.prisma e prisma.config.ts
COPY . .

# DATABASE_URL fictício, só para satisfazer a validação do prisma.config.ts durante o build.
# O prisma generate não se liga de facto à base de dados, só precisa que a variável exista.
# O valor real (do .env) só é usado depois, em runtime, quando o container arranca.
ENV DATABASE_URL="mysql://build:build@localhost:3306/build"

# Gera o Prisma Client dentro da imagem
RUN npx prisma generate

# Dá permissão de execução ao entrypoint
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]