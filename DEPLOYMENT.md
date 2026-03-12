# ISP NOC System - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the ISP NOC System on a Ubuntu Server with MySQL/MariaDB backend.

## System Requirements

- **OS**: Ubuntu 20.04 LTS or newer
- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB+ recommended
- **Storage**: 20GB minimum
- **Database**: MySQL 5.7+ or MariaDB 10.3+
- **Node.js**: 18+ (will be installed)

## Pre-Deployment Checklist

- [ ] Ubuntu server is updated and accessible via SSH
- [ ] You have root or sudo access
- [ ] Port 80 and 443 are available
- [ ] You have a domain name (optional, for HTTPS)
- [ ] Database credentials are prepared

## Quick Start (Automated)

### 1. Download and Run Deployment Script

```bash
# SSH into your Ubuntu server
ssh user@your-server-ip

# Download the deployment script
wget https://your-repo/deploy.sh
chmod +x deploy.sh

# Run the script with sudo
sudo ./deploy.sh
```

The script will:
- Update system packages
- Install Node.js 22
- Install and configure MariaDB
- Create database and user
- Install Nginx as reverse proxy
- Install PM2 for process management
- Create systemd service for auto-start

### 2. Configure Environment Variables

```bash
# Edit the environment file
sudo nano /opt/isp_noc_system/.env
```

Add your configuration:

```env
# Database Configuration
DATABASE_URL="mysql://isp_noc_user:your_password@localhost:3306/isp_noc_db"

# Application
NODE_ENV=production
PORT=3000

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret_here

# OAuth Configuration (from Manus)
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im

# Owner Information
OWNER_OPEN_ID=your_owner_id
OWNER_NAME="Your Name"

# Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your_website_id

# App Info
VITE_APP_TITLE="ISP NOC System"
VITE_APP_LOGO="https://example.com/logo.png"
```

### 3. Deploy Application

```bash
# Copy application files to server
scp -r isp_noc_system/ user@your-server-ip:/opt/

# SSH into server
ssh user@your-server-ip

# Change to app directory
cd /opt/isp_noc_system

# Install dependencies and build
pnpm install
pnpm build

# Start the service
sudo systemctl start isp_noc_system
sudo systemctl enable isp_noc_system

# Check status
sudo systemctl status isp_noc_system
```

## Manual Deployment (Step-by-Step)

### Step 1: System Setup

```bash
# Update packages
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2
npm install -g pm2
```

### Step 2: Database Setup

```bash
# Install MariaDB
sudo apt-get install -y mariadb-server mariadb-client

# Start MariaDB
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Secure installation (optional but recommended)
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root <<EOF
CREATE DATABASE \`isp_noc_db\`;
CREATE USER 'isp_noc_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON \`isp_noc_db\`.* TO 'isp_noc_user'@'localhost';
FLUSH PRIVILEGES;
EOF
```

### Step 3: Application Setup

```bash
# Create application directory
sudo mkdir -p /opt/isp_noc_system
sudo chown $USER:$USER /opt/isp_noc_system

# Copy application files
cp -r isp_noc_system/* /opt/isp_noc_system/

# Install dependencies
cd /opt/isp_noc_system
pnpm install

# Create .env file
cp .env.example .env
nano .env  # Edit with your configuration

# Build application
pnpm build
```

### Step 4: Nginx Configuration

```bash
# Install Nginx
sudo apt-get install -y nginx

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/isp_noc_system > /dev/null <<EOF
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
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/isp_noc_system /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 5: Systemd Service

```bash
# Create systemd service file
sudo tee /etc/systemd/system/isp_noc_system.service > /dev/null <<EOF
[Unit]
Description=ISP NOC System
After=network.target mariadb.service

[Service]
Type=simple
User=$USER
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

# Reload systemd
sudo systemctl daemon-reload

# Start service
sudo systemctl start isp_noc_system
sudo systemctl enable isp_noc_system
```

## Verification

### Check Service Status

```bash
# Check systemd service
sudo systemctl status isp_noc_system

# View logs
sudo journalctl -u isp_noc_system -f

# Check PM2 status
pm2 status

# Check Nginx
sudo systemctl status nginx
```

### Test Application

```bash
# Test local connection
curl http://localhost:3000

# Test through Nginx
curl http://localhost

# Test from remote
curl http://your-server-ip
```

## SSL/HTTPS Configuration (Optional)

### Using Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d your-domain.com

# Update Nginx configuration
sudo tee /etc/nginx/sites-available/isp_noc_system > /dev/null <<EOF
upstream isp_noc_system {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 100M;

    location / {
        proxy_pass http://isp_noc_system;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Restart Nginx
sudo systemctl restart nginx
```

## Maintenance

### Database Backup

```bash
# Create backup
mysqldump -u isp_noc_user -p isp_noc_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
mysql -u isp_noc_user -p isp_noc_db < backup_20240101_120000.sql
```

### Application Updates

```bash
# Pull latest code
cd /opt/isp_noc_system
git pull origin main

# Install dependencies
pnpm install

# Build
pnpm build

# Restart service
sudo systemctl restart isp_noc_system
```

### Monitoring

```bash
# Monitor logs in real-time
sudo journalctl -u isp_noc_system -f

# Monitor PM2 processes
pm2 monit

# Check disk space
df -h

# Check memory usage
free -h
```

## Troubleshooting

### Application won't start

```bash
# Check logs
sudo journalctl -u isp_noc_system -n 50

# Check if port is in use
sudo lsof -i :3000

# Check database connection
mysql -u isp_noc_user -p -h localhost isp_noc_db -e "SELECT 1;"
```

### Database connection issues

```bash
# Check MariaDB status
sudo systemctl status mariadb

# Test connection
mysql -u isp_noc_user -p -h localhost

# Check database exists
mysql -u root -e "SHOW DATABASES;"
```

### Nginx issues

```bash
# Test configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

## Performance Tuning

### Database Optimization

```bash
# Edit MariaDB configuration
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf

# Add these settings for better performance:
max_connections=1000
innodb_buffer_pool_size=2G
innodb_log_file_size=512M
```

### Node.js Optimization

```bash
# Use cluster mode with PM2
pm2 start dist/index.js -i max --name "isp-noc-system"

# Monitor CPU and memory
pm2 monit
```

## Security Considerations

- Keep system packages updated: `sudo apt-get update && sudo apt-get upgrade`
- Use strong database passwords
- Enable firewall: `sudo ufw enable`
- Configure firewall rules: `sudo ufw allow 22,80,443/tcp`
- Use HTTPS with Let's Encrypt
- Regularly backup database
- Monitor logs for suspicious activity
- Keep Node.js and dependencies updated

## Support

For issues or questions, refer to:
- Application logs: `sudo journalctl -u isp_noc_system -f`
- Database logs: `sudo tail -f /var/log/mysql/error.log`
- Nginx logs: `sudo tail -f /var/log/nginx/error.log`
