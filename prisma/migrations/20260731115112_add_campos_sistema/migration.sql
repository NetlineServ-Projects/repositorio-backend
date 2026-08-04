/*
  Warnings:

  - You are about to drop the column `tecnologias` on the `sistemas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `sistemas` DROP COLUMN `tecnologias`,
    ADD COLUMN `ativo` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `repositorioUrl` VARCHAR(255) NULL,
    ADD COLUMN `responsavelTecnico` VARCHAR(255) NULL,
    ADD COLUMN `tecnologiasBackend` JSON NULL,
    ADD COLUMN `tecnologiasFrontend` JSON NULL,
    ADD COLUMN `tecnologiasInfraestrutura` JSON NULL,
    ADD COLUMN `urlProducao` VARCHAR(255) NULL,
    ADD COLUMN `versaoAtual` VARCHAR(50) NULL;
