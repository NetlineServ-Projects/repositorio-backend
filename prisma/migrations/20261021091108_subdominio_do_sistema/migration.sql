-- 1. Colunas novas, nulas até serem preenchidas
ALTER TABLE `subdominios`
  ADD COLUMN `sistemaId` INTEGER NULL,
  ADD COLUMN `ambiente` ENUM('PRODUCAO', 'TESTES') NULL;

-- 2. Copia o sistema e o ambiente da infraestrutura a que cada subdomínio pertencia
UPDATE `subdominios` s
  JOIN `SistemaInfraestrutura` i ON i.`id` = s.`sistemaInfraestruturaId`
  SET s.`sistemaId` = i.`sistemaId`, s.`ambiente` = i.`ambiente`;

-- 3. Um subdomínio que não tenha ficado com sistema não devia existir
DELETE FROM `subdominios` WHERE `sistemaId` IS NULL;

-- 4. As colunas passam a obrigatórias
ALTER TABLE `subdominios`
  MODIFY `sistemaId` INTEGER NOT NULL,
  MODIFY `ambiente` ENUM('PRODUCAO', 'TESTES') NOT NULL;

-- 5. Um subdomínio por sistema e ambiente. O índice cria-se ANTES da chave
--    estrangeira, para o MySQL a usar e não criar um índice extra.
CREATE UNIQUE INDEX `subdominios_sistemaId_ambiente_key` ON `subdominios`(`sistemaId`, `ambiente`);
ALTER TABLE `subdominios` ADD CONSTRAINT `subdominios_sistemaId_fkey` FOREIGN KEY (`sistemaId`) REFERENCES `sistemas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. Remove a ligação antiga: primeiro a chave estrangeira, depois o índice, depois a coluna
ALTER TABLE `subdominios` DROP FOREIGN KEY `subdominios_sistemaInfraestruturaId_fkey`;
DROP INDEX `subdominios_sistemaInfraestruturaId_key` ON `subdominios`;
ALTER TABLE `subdominios` DROP COLUMN `sistemaInfraestruturaId`;