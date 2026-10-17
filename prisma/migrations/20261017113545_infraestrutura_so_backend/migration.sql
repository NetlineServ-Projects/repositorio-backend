-- 1. O frontend deixa de ter infraestrutura: apaga os registos de Frontend
--    (as credenciais e os subdomínios deles saem em cascata)
DELETE FROM `SistemaInfraestrutura` WHERE `componente` = 'FRONTEND';

-- 2. Volta a haver um registo por sistema e ambiente.
--    O índice novo cria-se ANTES de apagar o antigo, porque a chave estrangeira
--    do sistema precisa de um índice que comece por sistemaId.
CREATE UNIQUE INDEX `SistemaInfraestrutura_sistemaId_ambiente_key` ON `SistemaInfraestrutura`(`sistemaId`, `ambiente`);
DROP INDEX `SistemaInfraestrutura_sistemaId_ambiente_componente_key` ON `SistemaInfraestrutura`;
ALTER TABLE `SistemaInfraestrutura` DROP COLUMN `componente`;

-- 3. Imagem do backend
ALTER TABLE `SistemaInfraestrutura` ADD COLUMN `imagemId` INTEGER NULL;
CREATE INDEX `SistemaInfraestrutura_imagemId_idx` ON `SistemaInfraestrutura`(`imagemId`);
ALTER TABLE `SistemaInfraestrutura` ADD CONSTRAINT `SistemaInfraestrutura_imagemId_fkey` FOREIGN KEY (`imagemId`) REFERENCES `ImagemContainer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Sistema: URL de testes e plataforma do frontend
ALTER TABLE `sistemas` ADD COLUMN `urlTestes` VARCHAR(255) NULL, ADD COLUMN `plataformaFrontendId` INTEGER NULL;
CREATE INDEX `sistemas_plataformaFrontendId_idx` ON `sistemas`(`plataformaFrontendId`);
ALTER TABLE `sistemas` ADD CONSTRAINT `sistemas_plataformaFrontendId_fkey` FOREIGN KEY (`plataformaFrontendId`) REFERENCES `plataformas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;