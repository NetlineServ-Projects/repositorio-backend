/*
  Warnings:

  - A unique constraint covering the columns `[dominioId,nome,tipoDns]` on the table `subdominios` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `subdominios` DROP FOREIGN KEY `subdominios_dominioId_fkey`;

-- DropIndex
DROP INDEX `subdominios_dominioId_nome_key` ON `subdominios`;

-- AlterTable
ALTER TABLE `plataformas` ADD COLUMN `fornecedorContainer` ENUM('DOCKER_HUB', 'GITHUB_CONTAINER_REGISTRY', 'AWS_ECR', 'GOOGLE_ARTIFACT_REGISTRY', 'AZURE_CONTAINER_REGISTRY', 'GITLAB_REGISTRY', 'KUBERNETES', 'DOCKER_SWARM', 'PORTAINER', 'OUTRO') NULL,
    ADD COLUMN `namespace` VARCHAR(191) NULL,
    ADD COLUMN `registryTokenEnc` TEXT NULL,
    ADD COLUMN `registryUrl` TEXT NULL,
    ADD COLUMN `registryUtilizador` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `subdominios` MODIFY `tipoDns` ENUM('A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA', 'PTR', 'SOA', 'DS', 'DNSKEY', 'RRSIG', 'TLSA', 'SSHFP', 'OUTRO') NOT NULL DEFAULT 'A',
    MODIFY `destino` TEXT NULL;

-- CreateTable
CREATE TABLE `ImagemContainer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `tag` VARCHAR(191) NOT NULL DEFAULT 'latest',
    `portaExposta` INTEGER NULL,
    `digest` VARCHAR(191) NULL,
    `ultimoPushEm` DATETIME(3) NULL,
    `visibilidade` ENUM('PUBLICA', 'PRIVADA') NOT NULL DEFAULT 'PRIVADA',
    `origem` ENUM('PROPRIA', 'TERCEIROS') NOT NULL DEFAULT 'PROPRIA',
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `plataformaId` INTEGER NOT NULL,

    UNIQUE INDEX `ImagemContainer_plataformaId_nome_tag_key`(`plataformaId`, `nome`, `tag`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `subdominios_dominioId_idx` ON `subdominios`(`dominioId`);

-- CreateIndex
CREATE UNIQUE INDEX `subdominios_dominioId_nome_tipoDns_key` ON `subdominios`(`dominioId`, `nome`, `tipoDns`);

-- AddForeignKey
ALTER TABLE `ImagemContainer` ADD CONSTRAINT `ImagemContainer_plataformaId_fkey` FOREIGN KEY (`plataformaId`) REFERENCES `plataformas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

