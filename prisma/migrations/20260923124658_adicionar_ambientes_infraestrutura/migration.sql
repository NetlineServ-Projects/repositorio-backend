/*
  Warnings:

  - A unique constraint covering the columns `[sistemaId,ambiente]` on the table `SistemaInfraestrutura` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `SistemaInfraestrutura` DROP FOREIGN KEY `SistemaInfraestrutura_sistemaId_fkey`;

-- DropIndex
DROP INDEX `SistemaInfraestrutura_sistemaId_key` ON `SistemaInfraestrutura`;

-- AlterTable
ALTER TABLE `SistemaInfraestrutura` ADD COLUMN `ambiente` ENUM('PRODUCAO', 'TESTES', 'DESENVOLVIMENTO') NOT NULL DEFAULT 'PRODUCAO';

-- CreateIndex
CREATE UNIQUE INDEX `SistemaInfraestrutura_sistemaId_ambiente_key` ON `SistemaInfraestrutura`(`sistemaId`, `ambiente`);

