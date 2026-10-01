FROM node:22-bullseye AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Valor fictício só para o prisma generate (exigido pelo prisma.config.ts)
ARG DATABASE_URL="mysql://build:build@localhost:3306/build"
RUN npx prisma generate

RUN mkdir -p /usr/src/app/logs && \
    chown -R node:node /usr/src/app


FROM node:22-bullseye

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .

RUN mkdir -p logs && chown -R node:node logs

RUN mkdir -p uploads/avatars uploads/documentos && chown -R node:node uploads

USER node
EXPOSE 3000

CMD ["npm", "run", "start:prod"]