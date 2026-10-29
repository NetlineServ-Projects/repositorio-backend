# Debian 12 (bookworm), com suporte; a variante "slim" tem uma fração do tamanho da completa.
# As duas fases usam a mesma base para o motor do Prisma gerado coincidir com o da execução.
FROM node:22-bookworm-slim AS base
# O motor do Prisma precisa do OpenSSL; os certificados servem para ligações TLS
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app


FROM base AS builder

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Valor fictício só para o prisma generate (exigido pelo prisma.config.ts)
ARG DATABASE_URL="mysql://build:build@localhost:3306/build"
RUN npx prisma generate

# A imagem final fica só com as dependências de produção (o prisma CLI está nelas,
# porque é preciso no arranque para aplicar as migrações)
RUN npm prune --omit=dev


FROM base

ENV NODE_ENV=production

COPY --from=builder --chown=node:node /usr/src/app .

RUN mkdir -p logs uploads/avatars uploads/documentos uploads/plataformas \
    && chown -R node:node logs uploads

USER node
EXPOSE 3000

# Usa o endpoint de saúde da própria API (a imagem slim não tem curl)
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Migrações e seed no arranque, a não ser que MIGRAR_NO_ARRANQUE=false (o pipeline aplica-as
# num passo próprio, antes de trocar a API). O "exec" põe o node como processo principal,
# para receber o sinal de paragem do Docker e terminar de forma ordenada.
CMD ["sh", "-c", "if [ \"$MIGRAR_NO_ARRANQUE\" != \"false\" ]; then npx prisma migrate deploy && node prisma/seed.js; fi && exec node src/server.js"]
