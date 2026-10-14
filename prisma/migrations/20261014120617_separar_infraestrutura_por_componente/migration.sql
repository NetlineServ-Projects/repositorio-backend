/*
  Warnings:

  - The values [DESENVOLVIMENTO] on the enum `SistemaInfraestrutura_ambiente` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[sistemaId,ambiente,componente]` on the table `SistemaInfraestrutura` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sistemaInfraestruturaId]` on the table `subdominios` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sistemaInfraestruturaId` to the `subdominios` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `SistemaInfraestrutura` DROP FOREIGN KEY `SistemaInfraestrutura_sistemaId_fkey`;

-- DropForeignKey
ALTER TABLE `subdominios` DROP FOREIGN KEY `subdominios_dominioId_fkey`;

-- DropIndex
DROP INDEX `SistemaInfraestrutura_sistemaId_ambiente_key` ON `SistemaInfraestrutura`;

-- AlterTable
ALTER TABLE `SistemaInfraestrutura` ADD COLUMN `componente` ENUM('FRONTEND', 'BACKEND') NOT NULL DEFAULT 'BACKEND',
    MODIFY `ambiente` ENUM('PRODUCAO', 'TESTES') NOT NULL DEFAULT 'PRODUCAO';

-- AlterTable
ALTER TABLE `subdominios` ADD COLUMN `sistemaInfraestruturaId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `SistemaInfraestrutura_sistemaId_ambiente_componente_key` ON `SistemaInfraestrutura`(`sistemaId`, `ambiente`, `componente`);

-- CreateIndex
CREATE UNIQUE INDEX `subdominios_sistemaInfraestruturaId_key` ON `subdominios`(`sistemaInfraestruturaId`);

-- AddForeignKey
ALTER TABLE `subdominios` ADD CONSTRAINT `subdominios_dominioId_fkey` FOREIGN KEY (`dominioId`) REFERENCES `dominios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subdominios` ADD CONSTRAINT `subdominios_sistemaInfraestruturaId_fkey` FOREIGN KEY (`sistemaInfraestruturaId`) REFERENCES `SistemaInfraestrutura`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SistemaInfraestrutura` ADD CONSTRAINT `SistemaInfraestrutura_sistemaId_fkey` FOREIGN KEY (`sistemaId`) REFERENCES `sistemas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;