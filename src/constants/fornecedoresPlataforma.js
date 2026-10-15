// Fonte única dos fornecedores de cada tipo de plataforma. Os valores têm de
// coincidir com o enum FornecedorPlataforma do schema.prisma.
const FORNECEDORES_POR_TIPO = {
  CONTAINERIZACAO: [
    { valor: "DOCKER_HUB", rotulo: "Docker Hub", urlPainel: "https://hub.docker.com", registryUrl: "docker.io" },
    { valor: "GITHUB_CONTAINER_REGISTRY", rotulo: "GitHub Container Registry", urlPainel: "https://github.com", registryUrl: "ghcr.io" },
    { valor: "AWS_ECR", rotulo: "AWS ECR" },
    { valor: "GOOGLE_ARTIFACT_REGISTRY", rotulo: "Google Artifact Registry" },
    { valor: "AZURE_CONTAINER_REGISTRY", rotulo: "Azure Container Registry" },
    { valor: "GITLAB_REGISTRY", rotulo: "GitLab Registry", urlPainel: "https://gitlab.com", registryUrl: "registry.gitlab.com" },
    { valor: "KUBERNETES", rotulo: "Kubernetes" },
    { valor: "DOCKER_SWARM", rotulo: "Docker Swarm" },
    { valor: "PORTAINER", rotulo: "Portainer" },
    { valor: "OUTRO", rotulo: "Outro" },
  ],
  CLOUD_BASE_DADOS: [
    { valor: "AWS", rotulo: "AWS", urlPainel: "https://console.aws.amazon.com" },
    { valor: "MICROSOFT_AZURE", rotulo: "Microsoft Azure", urlPainel: "https://portal.azure.com" },
    { valor: "GOOGLE_CLOUD", rotulo: "Google Cloud", urlPainel: "https://console.cloud.google.com" },
    { valor: "ORACLE_CLOUD", rotulo: "Oracle Cloud" },
    { valor: "DIGITALOCEAN", rotulo: "DigitalOcean", urlPainel: "https://cloud.digitalocean.com" },
    { valor: "HETZNER_CLOUD", rotulo: "Hetzner Cloud", urlPainel: "https://console.hetzner.cloud" },
    { valor: "LINODE", rotulo: "Linode" },
    { valor: "VULTR", rotulo: "Vultr" },
    { valor: "OVHCLOUD", rotulo: "OVHcloud" },
    { valor: "CONTABO", rotulo: "Contabo" },
    { valor: "VERCEL", rotulo: "Vercel", urlPainel: "https://vercel.com/dashboard" },
    { valor: "NETLIFY", rotulo: "Netlify", urlPainel: "https://app.netlify.com" },
    { valor: "RAILWAY", rotulo: "Railway" },
    { valor: "RENDER", rotulo: "Render" },
    { valor: "FLY_IO", rotulo: "Fly.io" },
    { valor: "HEROKU", rotulo: "Heroku", urlPainel: "https://dashboard.heroku.com" },
    { valor: "SUPABASE", rotulo: "Supabase" },
    { valor: "PLANETSCALE", rotulo: "PlanetScale" },
    { valor: "MONGODB_ATLAS", rotulo: "MongoDB Atlas", urlPainel: "https://cloud.mongodb.com" },
    { valor: "NEON", rotulo: "Neon" },
    { valor: "AIVEN", rotulo: "Aiven" },
    { valor: "FIREBASE", rotulo: "Firebase" },
    { valor: "OUTRO", rotulo: "Outro" },
  ],
  GESTAO_DOMINIO: [
    { valor: "CLOUDFLARE", rotulo: "Cloudflare", urlPainel: "https://dash.cloudflare.com" },
    { valor: "GODADDY", rotulo: "GoDaddy" },
    { valor: "NAMECHEAP", rotulo: "Namecheap" },
    { valor: "GANDI", rotulo: "Gandi", urlPainel: "https://admin.gandi.net" },
    { valor: "PORKBUN", rotulo: "Porkbun" },
    { valor: "HOSTINGER", rotulo: "Hostinger" },
    { valor: "SQUARESPACE_DOMAINS", rotulo: "Squarespace Domains" },
    { valor: "AWS_ROUTE_53", rotulo: "AWS Route 53" },
    { valor: "AZURE_DNS", rotulo: "Azure DNS" },
    { valor: "GOOGLE_CLOUD_DNS", rotulo: "Google Cloud DNS" },
    { valor: "CPANEL", rotulo: "cPanel" },
    { valor: "AGENTE_REGISTO_MZ", rotulo: "Agente de registo .mz" },
    { valor: "OUTRO", rotulo: "Outro" },
  ],
};

const TODOS_OS_FORNECEDORES = [
  ...new Set(Object.values(FORNECEDORES_POR_TIPO).flat().map((f) => f.valor)),
];

function obterFornecedor(tipo, valor) {
  return (FORNECEDORES_POR_TIPO[tipo] ?? []).find((f) => f.valor === valor) ?? null;
}

function fornecedorPertenceAoTipo(tipo, valor) {
  return obterFornecedor(tipo, valor) !== null;
}

module.exports = {
  FORNECEDORES_POR_TIPO,
  TODOS_OS_FORNECEDORES,
  obterFornecedor,
  fornecedorPertenceAoTipo,
};