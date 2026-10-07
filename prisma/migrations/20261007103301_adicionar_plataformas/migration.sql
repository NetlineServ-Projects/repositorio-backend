-- AlterTable
ALTER TABLE `SistemaInfraestrutura` ADD COLUMN `plataformaId` INTEGER NULL,
    ADD COLUMN `servidorId` INTEGER NULL,
    ADD COLUMN `url` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `plataformas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `tipo` ENUM('CLOUD_BASE_DADOS', 'CONTAINERIZACAO', 'GESTAO_DOMINIO') NOT NULL,
    `urlPainel` VARCHAR(255) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `plataformas_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dominios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `dataExpiracao` DATETIME(3) NOT NULL,
    `plataformaId` INTEGER NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `dominios_nome_key`(`nome`),
    INDEX `dominios_plataformaId_idx`(`plataformaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subdominios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `tipoDns` ENUM('A', 'AAAA', 'CNAME') NOT NULL DEFAULT 'A',
    `destino` VARCHAR(255) NULL,
    `dominioId` INTEGER NOT NULL,
    `servidorId` INTEGER NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `subdominios_servidorId_idx`(`servidorId`),
    UNIQUE INDEX `subdominios_dominioId_nome_key`(`dominioId`, `nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servidores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `hostname` VARCHAR(255) NOT NULL,
    `ipCifrado` TEXT NOT NULL,
    `ipHash` VARCHAR(64) NOT NULL,
    `usernameSsh` VARCHAR(255) NOT NULL,
    `passwordCifrada` TEXT NOT NULL,
    `numeroCpu` INTEGER NOT NULL,
    `memoriaRam` INTEGER NOT NULL,
    `memoriaRamUnidade` ENUM('MB', 'GB', 'TB') NOT NULL DEFAULT 'GB',
    `disco` INTEGER NOT NULL,
    `discoUnidade` ENUM('MB', 'GB', 'TB') NOT NULL DEFAULT 'GB',
    `larguraBanda` INTEGER NOT NULL,
    `larguraBandaUnidade` ENUM('MBPS', 'GBPS') NOT NULL DEFAULT 'MBPS',
    `sistemaOperativo` VARCHAR(100) NOT NULL,
    `versaoSo` VARCHAR(50) NULL,
    `cloud` VARCHAR(255) NULL,
    `regiao` VARCHAR(100) NULL,
    `plataformaId` INTEGER NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `servidores_plataformaId_idx`(`plataformaId`),
    UNIQUE INDEX `servidores_plataformaId_ipHash_key`(`plataformaId`, `ipHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `SistemaInfraestrutura_servidorId_idx` ON `SistemaInfraestrutura`(`servidorId`);

-- CreateIndex
CREATE INDEX `SistemaInfraestrutura_plataformaId_idx` ON `SistemaInfraestrutura`(`plataformaId`);

-- AddForeignKey
ALTER TABLE `dominios` ADD CONSTRAINT `dominios_plataformaId_fkey` FOREIGN KEY (`plataformaId`) REFERENCES `plataformas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subdominios` ADD CONSTRAINT `subdominios_dominioId_fkey` FOREIGN KEY (`dominioId`) REFERENCES `dominios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subdominios` ADD CONSTRAINT `subdominios_servidorId_fkey` FOREIGN KEY (`servidorId`) REFERENCES `servidores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servidores` ADD CONSTRAINT `servidores_plataformaId_fkey` FOREIGN KEY (`plataformaId`) REFERENCES `plataformas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SistemaInfraestrutura` ADD CONSTRAINT `SistemaInfraestrutura_servidorId_fkey` FOREIGN KEY (`servidorId`) REFERENCES `servidores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SistemaInfraestrutura` ADD CONSTRAINT `SistemaInfraestrutura_plataformaId_fkey` FOREIGN KEY (`plataformaId`) REFERENCES `plataformas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
