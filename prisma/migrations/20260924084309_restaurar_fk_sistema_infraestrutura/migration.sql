-- AddForeignKey
ALTER TABLE `SistemaInfraestrutura` ADD CONSTRAINT `SistemaInfraestrutura_sistemaId_fkey` FOREIGN KEY (`sistemaId`) REFERENCES `sistemas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
