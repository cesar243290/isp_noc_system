# ISP NOC System - Quick Start Guide

## 🎯 Deploy em 5 Minutos

### Opção 1: Deployment Automático (Recomendado)

```bash
# 1. SSH para seu servidor
ssh seu_usuario@seu_servidor_ip

# 2. Copie os arquivos
scp -r isp_noc_system/ seu_usuario@seu_servidor_ip:/tmp/

# 3. Execute o script de deployment
cd /tmp/isp_noc_system
sudo bash deploy.sh

# 4. Configure o .env
sudo nano /opt/isp_noc_system/.env

# 5. Build e inicie
cd /opt/isp_noc_system
sudo -u appuser pnpm install
sudo -u appuser pnpm build
sudo systemctl start isp_noc_system

# 6. Acesse
http://seu_servidor_ip
```

### Opção 2: Usando Git

```bash
ssh seu_usuario@seu_servidor_ip

# Clone o repositório
git clone https://seu-repo/isp_noc_system.git /tmp/isp_noc_system
cd /tmp/isp_noc_system

# Execute deployment
sudo bash deploy.sh

# Configure e inicie
sudo nano /opt/isp_noc_system/.env
cd /opt/isp_noc_system
sudo -u appuser pnpm install
sudo -u appuser pnpm build
sudo systemctl start isp_noc_system
```

## 📋 Variáveis de Ambiente Essenciais

Edite `/opt/isp_noc_system/.env`:

```env
# Database
DATABASE_URL="mysql://isp_noc_user:sua_senha@localhost:3306/isp_noc_db"

# Application
NODE_ENV=production
PORT=3000

# Security
JWT_SECRET=$(openssl rand -base64 32)

# OAuth (obtenha em https://manus.im)
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im

# Owner
OWNER_OPEN_ID=seu_owner_id
OWNER_NAME="Seu Nome"

# APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_chave_api
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua_chave_frontend

# App
VITE_APP_TITLE="ISP NOC System"
VITE_APP_LOGO="https://seu-dominio.com/logo.png"
```

## ✅ Verificar Status

```bash
# Verificar se aplicação está rodando
sudo systemctl status isp_noc_system

# Ver logs
sudo journalctl -u isp_noc_system -f

# Verificar banco de dados
mysql -u isp_noc_user -p -h localhost isp_noc_db -e "SELECT 1;"

# Testar acesso
curl http://localhost:3000
```

## 🔄 Comandos Úteis

```bash
# Reiniciar aplicação
sudo systemctl restart isp_noc_system

# Parar aplicação
sudo systemctl stop isp_noc_system

# Iniciar aplicação
sudo systemctl start isp_noc_system

# Ver logs em tempo real
sudo journalctl -u isp_noc_system -f

# Atualizar código
cd /opt/isp_noc_system
git pull origin main
sudo -u appuser pnpm install
sudo -u appuser pnpm build
sudo systemctl restart isp_noc_system
```

## 🆘 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Porta 3000 em uso | `sudo lsof -i :3000` e `kill -9 <PID>` |
| Erro de conexão BD | `mysql -u isp_noc_user -p isp_noc_db` |
| Nginx 502 | `sudo systemctl restart isp_noc_system` |
| Permissão negada | `sudo chown -R appuser:appuser /opt/isp_noc_system` |
| Aplicação não inicia | `sudo journalctl -u isp_noc_system -n 50` |

## 📊 Acessar o Sistema

- **URL**: `http://seu_servidor_ip`
- **Login**: Use suas credenciais Manus
- **Dashboard**: Acesso automático após login
- **Admin**: Apenas usuários com role "admin"

## 🔐 Segurança Básica

```bash
# Ativar firewall
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Configurar HTTPS (Let's Encrypt)
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d seu-dominio.com
```

## 📚 Documentação Completa

- **DEPLOYMENT_UBUNTU.md** - Guia detalhado de deployment
- **README_ISP_NOC.md** - Visão geral do sistema
- **DEPLOYMENT.md** - Documentação geral

## 🎓 Próximos Passos

1. ✅ Deploy realizado
2. ✅ Aplicação rodando
3. 📝 Criar primeiro usuário admin
4. 🔐 Configurar HTTPS
5. 📊 Adicionar equipamentos
6. 🔔 Configurar monitoramento

---

**Precisa de ajuda?** Verifique os logs: `sudo journalctl -u isp_noc_system -f`
