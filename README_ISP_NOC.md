# ISP NOC System

Um sistema completo de gestão de NOC (Network Operations Center) para provedores de internet, desenvolvido com React, TypeScript, Express, tRPC e MySQL/MariaDB.

## Características Principais

### 1. Autenticação e Segurança
- Sistema de login com username/email e senha
- Sessões com validade de 24 horas
- Controle de acesso baseado em roles (ADMIN, NOC, VIEWER)
- Auditoria completa de todas as operações

### 2. Dashboard
- Visão geral com métricas em tempo real
- Total de equipamentos, ativos, interfaces e POPs
- Gráficos de status dos equipamentos
- Informações do sistema

### 3. Gestão de Equipamentos
- Cadastro completo de equipamentos de rede
- Tipos: OLT, Switch, Router, Server, Firewall, Radio Link
- Filtros por POP, tipo e status
- Busca por hostname e modelo
- Gerenciamento de credenciais de acesso
- Níveis de criticidade (P0-P3)

### 4. POPs (Pontos de Presença)
- Cadastro de locais/sites da rede
- Informações de localização (cidade, estado, endereço)
- Contatos locais e telefones
- Organização por localização geográfica

### 5. VLANs
- Gestão de VLANs com tipos: PPPoE, Corporativo, TR-069, Gerência, IPTV, VoIP, Backbone
- VLAN ID com validação (1-4094)
- Escopo global ou local
- Documentação e observações

### 6. Interfaces de Rede
- Tipos: Ethernet, Fibra, GPON, LAG, Loopback, VLAN
- Associação com equipamentos
- Status operacional (up/down)
- Velocidade e descrição
- Sistema de enlaces entre interfaces
- Documentação de VLANs transportadas

### 7. IPAM (Gestão de Sub-redes)
- Gestão de sub-redes por CIDR
- Tipos: CLIENT, MGMT, Backbone, Loopback, P2P
- Gateway e VRF
- Documentação de endressamento IP

### 8. Circuitos & Enlaces
- Tipos: PTP_FIBER, Transit IP, IX, Radio, MPLS, Layer 2
- Gestão de operadoras/providers
- Capacidade e SLA
- Status operacional

### 9. Serviços
- Tipos: PPPoE, TR-069, DHCP, DNS, RADIUS, Zabbix, Syslog, NTP, Grafana
- Associação com equipamentos e VLANs
- Vinculação a runbooks
- Documentação de serviços críticos

### 10. Monitoramento
- Tipos: ICMP (Ping), SNMP, Zabbix
- Teste manual de conectividade
- Atualização automática a cada 30 segundos
- Histórico de status (UP/DOWN/UNKNOWN)
- Medição de latência
- Contador de falhas consecutivas
- Mensagens de erro detalhadas

### 11. Runbooks
- Documentação de procedimentos operacionais
- Organização por categoria
- Vinculação a serviços

### 12. Checklists
- Listas de verificação para procedimentos
- Templates de checklists
- Organização por categoria

### 13. Administração
- Gestão de usuários (criação, edição, roles)
- Auditoria completa (logs de todas as operações)
- Rastreabilidade de quem fez o quê e quando

## Arquitetura Técnica

### Frontend
- **React 19** com TypeScript
- **TailwindCSS 4** para estilização
- **shadcn/ui** para componentes
- **Recharts** para gráficos
- **tRPC** para comunicação com backend
- **Wouter** para roteamento

### Backend
- **Express 4** como servidor
- **tRPC 11** para APIs type-safe
- **Drizzle ORM** para acesso ao banco
- **Zod** para validação de dados
- **JWT** para autenticação

### Banco de Dados
- **MySQL 5.7+** ou **MariaDB 10.3+**
- 15 tabelas com relacionamentos
- Migrations automáticas com Drizzle

## Estrutura do Projeto

```
isp_noc_system/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilitários
│   │   └── App.tsx        # Roteamento principal
│   └── public/            # Arquivos estáticos
├── server/                # Backend Express
│   ├── db.ts             # Query helpers
│   ├── routers.ts        # tRPC procedures
│   └── _core/            # Framework core
├── drizzle/              # Schema e migrations
│   ├── schema.ts         # Definição de tabelas
│   └── migrations/       # SQL migrations
├── shared/               # Código compartilhado
├── deploy.sh             # Script de deployment
├── DEPLOYMENT.md         # Guia de deployment
└── package.json          # Dependências
```

## Instalação Local

### Pré-requisitos
- Node.js 18+
- pnpm
- MySQL 5.7+ ou MariaDB 10.3+

### Setup

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Gerar migrations
pnpm drizzle-kit generate

# Aplicar migrations (via webdev_execute_sql ou mysql cli)
mysql -u user -p database < drizzle/migrations.sql

# Iniciar em desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Iniciar em produção
pnpm start
```

## Deployment

### Deployment Automático

```bash
# Executar script de deployment
sudo ./deploy.sh
```

### Deployment Manual

Veja [DEPLOYMENT.md](./DEPLOYMENT.md) para instruções detalhadas.

## Variáveis de Ambiente

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/database

# Application
NODE_ENV=production
PORT=3000

# Authentication
JWT_SECRET=your_jwt_secret

# OAuth (Manus)
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im

# Owner Info
OWNER_OPEN_ID=your_owner_id
OWNER_NAME=Your Name

# APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_key

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your_id

# App
VITE_APP_TITLE=ISP NOC System
VITE_APP_LOGO=https://example.com/logo.png
```

## Desenvolvimento

### Adicionar Nova Página

1. Criar componente em `client/src/pages/NovaPage.tsx`
2. Adicionar rota em `client/src/App.tsx`
3. Adicionar item de menu em `client/src/components/DashboardLayout.tsx`

### Adicionar Nova API

1. Definir schema em `drizzle/schema.ts`
2. Criar query helpers em `server/db.ts`
3. Adicionar procedures em `server/routers.ts`
4. Usar em componentes com `trpc.module.useQuery/useMutation`

### Testes

```bash
# Rodar testes
pnpm test

# Testes em watch mode
pnpm test --watch
```

## Segurança

- Senhas criptografadas no banco (SHA-256)
- Tokens JWT com expiração
- Validação de entrada com Zod
- Controle de acesso por role
- Auditoria de todas as operações
- HTTPS recomendado em produção
- Rate limiting (implementar conforme necessário)

## Performance

- Queries otimizadas com Drizzle ORM
- Caching de dados com React Query
- Compressão de assets
- Lazy loading de componentes
- Índices no banco de dados

## Suporte e Documentação

- Documentação de deployment: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Schema do banco: [drizzle/schema.ts](./drizzle/schema.ts)
- Procedures tRPC: [server/routers.ts](./server/routers.ts)
- Componentes: [client/src/components/](./client/src/components/)

## Licença

MIT

## Autor

ISP NOC System - Sistema de Gestão de Rede

---

**Versão**: 1.0.0  
**Data**: 2026-03-12  
**Status**: Pronto para Produção
