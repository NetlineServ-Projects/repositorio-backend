-- CreateTable
CREATE TABLE `notificacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('DOCUMENTO_SUBMETIDO', 'DOCUMENTO_APROVADO', 'DOCUMENTO_REJEITADO', 'DOMINIO_A_EXPIRAR', 'DOMINIO_EXPIRADO') NOT NULL,
    `referencia` VARCHAR(255) NOT NULL,
    `mensagem` TEXT NULL,
    `dataLimite` DATETIME(3) NULL,
    `lida` BOOLEAN NOT NULL DEFAULT false,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `chave` VARCHAR(100) NULL,
    `usuarioId` INTEGER NOT NULL,
    `documentoId` INTEGER NULL,
    `dominioId` INTEGER NULL,

    INDEX `notificacoes_usuarioId_lida_idx`(`usuarioId`, `lida`),
    INDEX `notificacoes_documentoId_idx`(`documentoId`),
    INDEX `notificacoes_dominioId_idx`(`dominioId`),
    UNIQUE INDEX `notificacoes_usuarioId_chave_key`(`usuarioId`, `chave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_documentoId_fkey` FOREIGN KEY (`documentoId`) REFERENCES `Documento`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_dominioId_fkey` FOREIGN KEY (`dominioId`) REFERENCES `dominios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
