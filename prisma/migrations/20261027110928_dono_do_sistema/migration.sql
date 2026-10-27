-- 1. Coluna nova: quem criou o sistema
ALTER TABLE `sistemas` ADD COLUMN `criadoPorId` INTEGER NULL;

-- 2. Os sistemas que já existem ficam com o autor da atividade "Criou o sistema ...".
--    Os que não tiverem esse registo ficam sem criador (só um ADMIN os pode gerir).
UPDATE `sistemas` s
  JOIN (
    SELECT a.`sistemaId`, a.`usuarioId`
    FROM `Atividade` a
    JOIN (
      SELECT `sistemaId`, MIN(`criadoEm`) AS `primeira`
      FROM `Atividade`
      WHERE `sistemaId` IS NOT NULL AND `acao` LIKE 'Criou o sistema%'
      GROUP BY `sistemaId`
    ) p ON p.`sistemaId` = a.`sistemaId` AND p.`primeira` = a.`criadoEm`
    WHERE a.`acao` LIKE 'Criou o sistema%'
  ) criador ON criador.`sistemaId` = s.`id`
  SET s.`criadoPorId` = criador.`usuarioId`;

-- 3. Índice e chave estrangeira
CREATE INDEX `sistemas_criadoPorId_idx` ON `sistemas`(`criadoPorId`);
ALTER TABLE `sistemas` ADD CONSTRAINT `sistemas_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
