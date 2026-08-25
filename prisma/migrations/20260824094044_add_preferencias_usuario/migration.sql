-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `idioma` VARCHAR(191) NOT NULL DEFAULT 'pt',
    ADD COLUMN `notificacoesEmail` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `temaEscuro` BOOLEAN NOT NULL DEFAULT false;
