-- CreateTable
CREATE TABLE `SistemaInfraestrutura` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sistemaId` INTEGER NOT NULL,
    `ipServidor` TEXT NULL,
    `cloudProvedor` TEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SistemaInfraestrutura_sistemaId_key`(`sistemaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CredencialSistema` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sistemaInfraestruturaId` INTEGER NOT NULL,
    `tipo` ENUM('ENV_VARIAVEIS', 'CREDENCIAIS_BD', 'CHAVE_TOKEN_API', 'CHAVE_SSH', 'CERTIFICADO_SSL', 'CREDENCIAIS_DNS', 'ACESSO_CONSOLA_CLOUD', 'CREDENCIAIS_CICD', 'CONFIGURACAO_VPN_FIREWALL', 'CREDENCIAIS_SMTP', 'BACKUP_ACESSO', 'OUTRO') NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `valorEncriptado` TEXT NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SistemaInfraestrutura` ADD CONSTRAINT `SistemaInfraestrutura_sistemaId_fkey` FOREIGN KEY (`sistemaId`) REFERENCES `sistemas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CredencialSistema` ADD CONSTRAINT `CredencialSistema_sistemaInfraestruturaId_fkey` FOREIGN KEY (`sistemaInfraestruturaId`) REFERENCES `SistemaInfraestrutura`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
