/*
  Warnings:

  - You are about to drop the `sistema` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `documento` DROP FOREIGN KEY `Documento_sistemaId_fkey`;

-- DropIndex
DROP INDEX `Documento_sistemaId_fkey` ON `documento`;

-- DropTable
DROP TABLE `sistema`;

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
    `tecnologias` JSON NULL,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Documento` ADD CONSTRAINT `Documento_sistemaId_fkey` FOREIGN KEY (`sistemaId`) REFERENCES `sistemas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
