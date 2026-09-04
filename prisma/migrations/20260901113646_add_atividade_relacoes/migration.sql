/*
  Warnings:

  - You are about to drop the column `alvo` on the `atividade` table. All the data in the column will be lost.
  - You are about to drop the column `usuario` on the `atividade` table. All the data in the column will be lost.
  - Added the required column `usuarioId` to the `Atividade` table without a default value. This is not possible if the table is not empty.

*/
-- Limpa dados antigos de teste (usuario/alvo eram texto solto, sem ligação real)
DELETE FROM `Atividade`;


-- AlterTable
ALTER TABLE `Atividade` DROP COLUMN `alvo`,
    DROP COLUMN `usuario`,
    ADD COLUMN `documentoId` INTEGER NULL,
    ADD COLUMN `usuarioId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Atividade` ADD CONSTRAINT `Atividade_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Atividade` ADD CONSTRAINT `Atividade_documentoId_fkey` FOREIGN KEY (`documentoId`) REFERENCES `Documento`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
