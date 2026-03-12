# ISP NOC System - Guia Completo de Deployment em Ubuntu Server

## 📋 Pré-requisitos

- Ubuntu 20.04 LTS ou superior
- Acesso SSH com privilégios sudo
- Mínimo 2GB RAM, recomendado 4GB+
- Mínimo 20GB de espaço em disco
- Conexão com internet estável

## 🚀 Deployment Rápido (5 minutos)

### Passo 1: Transferir Arquivos para o Servidor

```bash
# No seu computador local, copie os arquivos para o servidor
scp -r isp_noc_system/ seu_usuario@seu_servidor_ip:/tmp/

# Ou se preferir usar git:
ssh seu_usuario@seu_servidor_ip
cd /tmp
git clone https://seu-repo/isp_noc_system.git
```

### Passo 2: Executar Script de Deployment

```bash
# Conecte ao servidor
ssh seu_usuario@seu_servidor_ip

# Vá para o diretório da aplicação
cd /tmp/isp_noc_system

# Execute o script de deployment com sudo
sudo bash deploy.sh

# O script vai:
# ✓ Atualizar pacotes do sistema
# ✓ Instalar Node.js 22
# ✓ Instalar MariaDB
# ✓ Criar banco de dados
# ✓ Instalar Nginx
# ✓ Configurar PM2
# ✓ Criar serviço systemd
```

### Passo 3: Configurar Variáveis de Ambiente

```bash
# Edite o arquivo .env
sudo nano /opt/isp_noc_system/.env

# Preencha com suas configurações:
DATABASE_URL="mysql://isp_noc_user:sua_senha@localhost:3306/isp_noc_db"
NODE_ENV=production
PORT=3000
JWT_SECRET=gere_uma_chave_segura_com_openssl_rand_-base64_32
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
OWNER_OPEN_ID=seu_owner_id
OWNER_NAME="Seu Nome"
```

### Passo 4: Build e Deploy

```bash
# Entre no diretório da aplicação
cd /opt/isp_noc_system

# Instale dependências
sudo -u appuser pnpm install

# Build da aplicação
sudo -u appuser pnpm build

# Inicie o serviço
sudo systemctl start isp_noc_system

# Ative para iniciar automaticamente
sudo systemctl enable isp_noc_system

# Verifique o status
sudo systemctl status isp_noc_system
```

### Passo 5: Acessar a Aplicação

```
http://seu_servidor_ip
```

## 🔧 Deployment Manual (Passo a Passo)

Se preferir fazer manualmente, siga estes passos:

### 1. Atualizar Sistema

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 2. Instalar Node.js 22

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm pm2
```

### 3. Instalar MariaDB

```bash
sudo apt-get install -y mariadb-server mariadb-client
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Criar banco de dados
sudo mysql -u root <<EOF
CREATE DATABASE \`isp_noc_db\`;
CREATE USER 'isp_noc_user'@'localhost' IDENTIFIED BY 'sua_senha_aqui';
GRANT ALL PRIVILEGES ON \`isp_noc_db\`.* TO 'isp_noc_user'@'localhost';
FLUSH PRIVILEGES;
EOF
```

### 4. Instalar Nginx

```bash
sudo apt-get install -y nginx

# Criar configuração
sudo tee /etc/nginx/sites-available/isp_noc_system > /dev/null <<'EOF'
upstream isp_noc_system {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name _;
    client_max_body_size 100M;

    location / {
        proxy_pass http://isp_noc_system;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/isp_noc_system /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar e reiniciar
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 5. Preparar Aplicação

```bash
# Criar usuário da aplicação
sudo useradd -m -s /bin/bash appuser

# Criar diretório
sudo mkdir -p /opt/isp_noc_system
sudo chown -R appuser:appuser /opt/isp_noc_system

# Copiar arquivos
sudo cp -r /tmp/isp_noc_system/* /opt/isp_noc_system/
sudo chown -R appuser:appuser /opt/isp_noc_system

# Instalar dependências
cd /opt/isp_noc_system
sudo -u appuser pnpm install

# Build
sudo -u appuser pnpm build
```

### 6. Configurar Serviço Systemd

```bash
sudo tee /etc/systemd/system/isp_noc_system.service > /dev/null <<'EOF'
[Unit]
Description=ISP NOC System
After=network.target mariadb.service

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/isp_noc_system
ExecStart=/usr/local/bin/pm2 start dist/index.js --name "isp-noc-system" --env production
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="NODE_ENV=production"
Environment="PORT=3000"

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl start isp_noc_system
sudo systemctl enable isp_noc_system
```

## 🔐 Configurar HTTPS com Let's Encrypt

```bash
# Instalar Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Gerar certificado (substitua seu-dominio.com)
sudo certbot certonly --nginx -d seu-dominio.com

# Atualizar Nginx
sudo tee /etc/nginx/sites-available/isp_noc_system > /dev/null <<'EOF'
upstream isp_noc_system {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 100M;

    location / {
        proxy_pass http://isp_noc_system;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo systemctl restart nginx
```

## 📊 Monitoramento e Manutenção

### Ver Logs da Aplicação

```bash
# Logs em tempo real
sudo journalctl -u isp_noc_system -f

# Últimas 50 linhas
sudo journalctl -u isp_noc_system -n 50

# Logs de hoje
sudo journalctl -u isp_noc_system --since today
```

### Ver Logs do Nginx

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Monitorar Processos

```bash
# Ver status do PM2
pm2 status

# Monitorar em tempo real
pm2 monit

# Ver logs do PM2
pm2 logs
```

### Gerenciar Serviço

```bash
# Iniciar
sudo systemctl start isp_noc_system

# Parar
sudo systemctl stop isp_noc_system

# Reiniciar
sudo systemctl restart isp_noc_system

# Status
sudo systemctl status isp_noc_system

# Ver logs
sudo systemctl status isp_noc_system -l
```

## 🔄 Atualizar Aplicação

```bash
# Parar serviço
sudo systemctl stop isp_noc_system

# Atualizar código
cd /opt/isp_noc_system
sudo git pull origin main  # ou copiar novos arquivos

# Instalar dependências
sudo -u appuser pnpm install

# Build
sudo -u appuser pnpm build

# Iniciar serviço
sudo systemctl start isp_noc_system

# Verificar status
sudo systemctl status isp_noc_system
```

## 💾 Backup do Banco de Dados

```bash
# Criar backup
mysqldump -u isp_noc_user -p isp_noc_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar de backup
mysql -u isp_noc_user -p isp_noc_db < backup_20260312_120000.sql

# Backup automático diário (adicione ao crontab)
0 2 * * * mysqldump -u isp_noc_user -p'sua_senha' isp_noc_db > /backups/isp_noc_db_$(date +\%Y\%m\%d).sql
```

## 🐛 Troubleshooting

### Aplicação não inicia

```bash
# Verificar logs
sudo journalctl -u isp_noc_system -n 100

# Verificar se porta está em uso
sudo lsof -i :3000

# Verificar conexão com banco
mysql -u isp_noc_user -p -h localhost isp_noc_db -e "SELECT 1;"
```

### Nginx retorna erro 502

```bash
# Verificar se aplicação está rodando
pm2 status

# Verificar logs da aplicação
sudo journalctl -u isp_noc_system -f

# Reiniciar aplicação
sudo systemctl restart isp_noc_system
```

### Erro de permissão

```bash
# Corrigir permissões
sudo chown -R appuser:appuser /opt/isp_noc_system
sudo chmod -R 755 /opt/isp_noc_system
```

### Banco de dados não conecta

```bash
# Verificar se MariaDB está rodando
sudo systemctl status mariadb

# Reiniciar MariaDB
sudo systemctl restart mariadb

# Verificar credenciais
mysql -u isp_noc_user -p -h localhost
```

## 📈 Otimizações de Produção

### Aumentar Limites do Sistema

```bash
# Editar /etc/security/limits.conf
sudo nano /etc/security/limits.conf

# Adicionar:
appuser soft nofile 65535
appuser hard nofile 65535
appuser soft nproc 65535
appuser hard nproc 65535
```

### Otimizar MariaDB

```bash
# Editar /etc/mysql/mariadb.conf.d/50-server.cnf
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf

# Adicionar/modificar:
max_connections=1000
innodb_buffer_pool_size=2G
innodb_log_file_size=512M
slow_query_log=1
long_query_time=2
```

### Configurar Firewall

```bash
sudo ufw enable
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw status
```

## ✅ Checklist de Deployment

- [ ] Servidor Ubuntu 20.04+ preparado
- [ ] Node.js 22 instalado
- [ ] MariaDB instalado e configurado
- [ ] Banco de dados criado
- [ ] Nginx instalado e configurado
- [ ] PM2 instalado
- [ ] Aplicação copiada para /opt/isp_noc_system
- [ ] .env configurado com valores corretos
- [ ] Dependências instaladas (pnpm install)
- [ ] Aplicação compilada (pnpm build)
- [ ] Serviço systemd criado e ativado
- [ ] Aplicação iniciada com sucesso
- [ ] Nginx respondendo corretamente
- [ ] HTTPS configurado (opcional)
- [ ] Backups configurados
- [ ] Firewall configurado
- [ ] Monitoramento ativo

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: `sudo journalctl -u isp_noc_system -f`
2. Verifique a conexão com o banco: `mysql -u isp_noc_user -p isp_noc_db`
3. Verifique se as portas estão abertas: `sudo netstat -tulpn | grep LISTEN`
4. Reinicie os serviços: `sudo systemctl restart isp_noc_system nginx mariadb`

---

**Versão**: 1.0.0  
**Última atualização**: 2026-03-12  
**Status**: Pronto para Produção
