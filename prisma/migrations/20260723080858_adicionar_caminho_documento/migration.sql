/*
  Warnings:

  - Added the required column `caminho` to the `Documento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `documento` ADD COLUMN `caminho` VARCHAR(191) NOT NULL;
