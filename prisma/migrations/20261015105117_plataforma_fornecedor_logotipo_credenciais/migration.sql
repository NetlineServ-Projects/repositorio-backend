-- As plataformas sem fornecedor passam a OUTRO (o valor já existe no enum antigo)
UPDATE `plataformas` SET `fornecedorContainer` = 'OUTRO' WHERE `fornecedorContainer` IS NULL;

-- Renomeia as colunas (os dados mantêm-se) e acrescenta o logótipo
ALTER TABLE `plataformas`
  ADD COLUMN `logotipo` VARCHAR(255) NULL,
  CHANGE COLUMN `registryUtilizador` `utilizador` VARCHAR(191) NULL,
  CHANGE COLUMN `registryTokenEnc` `tokenCifrado` TEXT NULL,
  CHANGE COLUMN `fornecedorContainer` `fornecedor` ENUM(
    'DOCKER_HUB', 'GITHUB_CONTAINER_REGISTRY', 'AWS_ECR', 'GOOGLE_ARTIFACT_REGISTRY',
    'AZURE_CONTAINER_REGISTRY', 'GITLAB_REGISTRY', 'KUBERNETES', 'DOCKER_SWARM', 'PORTAINER',
    'AWS', 'MICROSOFT_AZURE', 'GOOGLE_CLOUD', 'ORACLE_CLOUD', 'DIGITALOCEAN', 'HETZNER_CLOUD',
    'LINODE', 'VULTR', 'OVHCLOUD', 'CONTABO', 'VERCEL', 'NETLIFY', 'RAILWAY', 'RENDER',
    'FLY_IO', 'HEROKU', 'SUPABASE', 'PLANETSCALE', 'MONGODB_ATLAS', 'NEON', 'AIVEN', 'FIREBASE',
    'CLOUDFLARE', 'GODADDY', 'NAMECHEAP', 'GANDI', 'PORKBUN', 'HOSTINGER', 'SQUARESPACE_DOMAINS',
    'AWS_ROUTE_53', 'AZURE_DNS', 'GOOGLE_CLOUD_DNS', 'CPANEL', 'AGENTE_REGISTO_MZ', 'OUTRO'
  ) NOT NULL;