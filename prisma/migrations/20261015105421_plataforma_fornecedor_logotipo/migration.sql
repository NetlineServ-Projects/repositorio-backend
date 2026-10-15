/*
  Warnings:

  - You are about to alter the column `fornecedor` on the `plataformas` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(8))` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE `plataformas` MODIFY `fornecedor` VARCHAR(100) NOT NULL;
