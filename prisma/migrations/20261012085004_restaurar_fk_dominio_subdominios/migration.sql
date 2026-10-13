-- AddForeignKey
ALTER TABLE `subdominios` ADD CONSTRAINT `subdominios_dominioId_fkey` FOREIGN KEY (`dominioId`) REFERENCES `dominios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
