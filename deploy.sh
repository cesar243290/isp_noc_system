#!/bin/bash

# ISP NOC System - Deployment Script for Ubuntu Server
# This script sets up the ISP NOC System on a fresh Ubuntu 20.04+ server

set -e

echo "========================================="
echo "ISP NOC System - Deployment Script"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run this script as root (use sudo)${NC}"
    exit 1
fi

# Get configuration from environment or use defaults
APP_NAME="${APP_NAME:-isp_noc_system}"
APP_PORT="${APP_PORT:-3000}"
APP_USER="${APP_USER:-appuser}"
APP_DIR="/opt/${APP_NAME}"
DB_NAME="${DB_NAME:-isp_noc_db}"
DB_USER="${DB_USER:-isp_noc_user}"
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 32)}"
DB_HOST="${DB_HOST:-localhost}"
NODE_ENV="production"

echo -e "${YELLOW}Configuration:${NC}"
echo "App Name: $APP_NAME"
echo "App Port: $APP_PORT"
echo "App Directory: $APP_DIR"
echo "Database: $DB_NAME"
echo "Database User: $DB_USER"
echo ""

# Step 1: Update system packages
echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# Step 2: Install Node.js
echo -e "${YELLOW}Step 2: Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
apt-get install -y nodejs

# Step 3: Install MySQL/MariaDB
echo -e "${YELLOW}Step 3: Installing MySQL/MariaDB...${NC}"
apt-get install -y mariadb-server mariadb-client

# Start MariaDB
systemctl start mariadb
systemctl enable mariadb

# Step 4: Create database and user
echo -e "${YELLOW}Step 4: Creating database and user...${NC}"
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;
CREATE USER IF NOT EXISTS '${DB_USER}'@'${DB_HOST}' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'${DB_HOST}';
FLUSH PRIVILEGES;
EOF

echo -e "${GREEN}Database created successfully!${NC}"

# Step 5: Create application user
echo -e "${YELLOW}Step 5: Creating application user...${NC}"
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$APP_USER"
    echo -e "${GREEN}User $APP_USER created${NC}"
fi

# Step 6: Create application directory
echo -e "${YELLOW}Step 6: Setting up application directory...${NC}"
mkdir -p "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

# Step 7: Install pnpm
echo -e "${YELLOW}Step 7: Installing pnpm...${NC}"
npm install -g pnpm

# Step 8: Install PM2 for process management
echo -e "${YELLOW}Step 8: Installing PM2...${NC}"
npm install -g pm2

# Step 9: Install Nginx
echo -e "${YELLOW}Step 9: Installing Nginx...${NC}"
apt-get install -y nginx

# Step 10: Create Nginx configuration
echo -e "${YELLOW}Step 10: Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/${APP_NAME} <<EOF
upstream ${APP_NAME} {
    server 127.0.0.1:${APP_PORT};
}

server {
    listen 80;
    server_name _;

    client_max_body_size 100M;

    location / {
        proxy_pass http://${APP_NAME};
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

# Enable Nginx site
ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

# Step 11: Create environment file template
echo -e "${YELLOW}Step 11: Creating environment configuration...${NC}"
cat > "$APP_DIR/.env.example" <<EOF
# Database Configuration
DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:3306/${DB_NAME}"

# Application
NODE_ENV=production
PORT=${APP_PORT}

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

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
EOF

echo -e "${GREEN}Environment template created at: $APP_DIR/.env.example${NC}"
echo -e "${YELLOW}Please edit $APP_DIR/.env with your actual configuration${NC}"

# Step 12: Create startup script
echo -e "${YELLOW}Step 12: Creating startup script...${NC}"
cat > "$APP_DIR/start.sh" <<'SCRIPT'
#!/bin/bash
set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Build application
echo "Building application..."
pnpm install
pnpm build

# Start with PM2
echo "Starting application with PM2..."
pm2 start dist/index.js --name "isp-noc-system" --env production

echo "Application started!"
SCRIPT

chmod +x "$APP_DIR/start.sh"
chown "$APP_USER:$APP_USER" "$APP_DIR/start.sh"

# Step 13: Create systemd service
echo -e "${YELLOW}Step 13: Creating systemd service...${NC}"
cat > /etc/systemd/system/${APP_NAME}.service <<EOF
[Unit]
Description=ISP NOC System
After=network.target mariadb.service

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${APP_DIR}
ExecStart=/usr/local/bin/pm2 start dist/index.js --name "isp-noc-system" --env production
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="NODE_ENV=production"
Environment="PORT=${APP_PORT}"

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload

# Step 14: Display summary
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Deployment Setup Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Copy your application files to: $APP_DIR"
echo "2. Edit the environment file: $APP_DIR/.env"
echo "3. Run: sudo systemctl start ${APP_NAME}"
echo "4. Enable auto-start: sudo systemctl enable ${APP_NAME}"
echo "5. Check status: sudo systemctl status ${APP_NAME}"
echo ""
echo -e "${YELLOW}Database Credentials:${NC}"
echo "Host: $DB_HOST"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Password: $DB_PASSWORD"
echo ""
echo -e "${YELLOW}Access the application:${NC}"
echo "http://$(hostname -I | awk '{print $1}')"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "View logs: sudo journalctl -u ${APP_NAME} -f"
echo "Restart service: sudo systemctl restart ${APP_NAME}"
echo "Stop service: sudo systemctl stop ${APP_NAME}"
echo ""
