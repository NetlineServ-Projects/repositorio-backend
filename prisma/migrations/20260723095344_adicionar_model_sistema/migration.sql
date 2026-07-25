-- AlterTable
ALTER TABLE `documento` ADD COLUMN `sistemaId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Sistema` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `descricao` TEXT NULL,
    `versao` VARCHAR(50) NOT NULL DEFAULT 'v1.0',
    `status` ENUM('Em Produção', 'Em Desenvolvimento', 'Manutenção') NOT NULL DEFAULT 'Em Desenvolvimento',
    `tecnologias` JSON NULL,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Documento` ADD CONSTRAINT `Documento_sistemaId_fkey` FOREIGN KEY (`sistemaId`) REFERENCES `Sistema`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
