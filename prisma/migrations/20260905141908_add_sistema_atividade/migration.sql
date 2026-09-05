/*
  Warnings:

  - You are about to drop the `Sistemas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Documento` DROP FOREIGN KEY `Documento_sistemaId_fkey`;

-- DropIndex
DROP INDEX `Documento_sistemaId_fkey` ON `Documento`;

-- AlterTable
ALTER TABLE `Atividade` ADD COLUMN `sistemaId` INTEGER NULL;

-- DropTable
DROP TABLE `Sistemas`;

-- CreateTable
CREATE TABLE `sistemas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `desenvolvedores` JSON NOT NULL,
    `empresasClientes` JSON NOT NULL,
    `descricaoCurta` VARCHAR(255) NULL,
    `descricaoLonga` TEXT NULL,
    `dataInicio` DATETIME(3) NOT NULL,
    `dataEntrega` DATETIME(3) NULL,
    `status` ENUM('Em Produção', 'Em Desenvolvimento', 'Manutenção') NOT NULL DEFAULT 'Em Desenvolvimento',
    `tecnologiasFrontend` JSON NULL,
    `tecnologiasBackend` JSON NULL,
    `tecnologiasInfraestrutura` JSON NULL,
    `repositorioUrl` VARCHAR(255) NULL,
    `urlProducao` VARCHAR(255) NULL,
    `responsavelTecnico` VARCHAR(255) NULL,
    `versaoAtual` VARCHAR(50) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Documento` ADD CONSTRAINT `Documento_sistemaId_fkey` FOREIGN KEY (`sistemaId`) REFERENCES `sistemas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Atividade` ADD CONSTRAINT `Atividade_sistemaId_fkey` FOREIGN KEY (`sistemaId`) REFERENCES `sistemas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
