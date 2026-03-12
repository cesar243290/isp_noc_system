# ISP NOC System - Guia Passo a Passo para Deploy no Ubuntu Server

## 📋 Checklist Pré-Deployment

Antes de começar, você precisa ter:

- [ ] Um servidor Ubuntu 20.04 LTS ou superior
- [ ] Acesso SSH ao servidor (com privilégios sudo)
- [ ] Os arquivos do ISP NOC System no seu computador
- [ ] Uma conexão estável com a internet
- [ ] Credenciais Manus (VITE_APP_ID, OAUTH_SERVER_URL, etc)

---

## 🚀 PASSO 1: Preparar o Computador Local

### 1.1 Verificar se você tem os arquivos

```bash
# No seu computador, verifique se o diretório existe
ls -la isp_noc_system/

# Você deve ver:
# - client/
# - server/
# - drizzle/
# - deploy.sh
# - DEPLOYMENT_UBUNTU.md
# - QUICK_START.md
# - package.json
```

### 1.2 Verificar SSH

```bash
# Teste a conexão SSH com seu servidor
ssh seu_usuario@seu_servidor_ip

# Se funcionar, você verá o prompt do servidor
# Digite 'exit' para sair
exit
```

---

## 🌐 PASSO 2: Transferir Arquivos para o Servidor

Escolha UMA das opções abaixo:

### Opção A: Usando SCP (Recomendado para arquivos locais)

```bash
# No seu computador local, execute:
scp -r isp_noc_system/ seu_usuario@seu_servidor_ip:/tmp/

# Isso vai copiar toda a pasta para /tmp/isp_noc_system no servidor
# Aguarde até terminar (pode levar alguns minutos)
```

### Opção B: Usando Git (Se você tem repositório)

```bash
# SSH para o servidor
ssh seu_usuario@seu_servidor_ip

# Clone o repositório
cd /tmp
git clone https://seu-repositorio/isp_noc_system.git

# Saia do servidor
exit
```

### Opção C: Usando SFTP (Se preferir interface gráfica)

```bash
# Use um cliente SFTP como FileZilla ou WinSCP
# Conecte ao seu servidor
# Copie a pasta isp_noc_system para /tmp/
```

---

## 🔑 PASSO 3: Conectar ao Servidor

```bash
# SSH para seu servidor
ssh seu_usuario@seu_servidor_ip

# Você deve ver algo como:
# seu_usuario@servidor:~$

# Verifique se os arquivos foram copiados
ls -la /tmp/isp_noc_system/

# Você deve ver os arquivos da aplicação
```

---

## ⚙️ PASSO 4: Executar Script de Deployment Automático

Este é o passo mais importante! O script vai fazer toda a configuração.

```bash
# Vá para o diretório da aplicação
cd /tmp/isp_noc_system

# Verifique se o script existe
ls -la deploy.sh

# Execute o script com sudo
sudo bash deploy.sh

# O script vai:
# ✓ Atualizar pacotes do sistema
# ✓ Instalar Node.js 22
# ✓ Instalar MariaDB
# ✓ Criar banco de dados
# ✓ Instalar Nginx
# ✓ Instalar PM2
# ✓ Criar serviço systemd
# ✓ Criar arquivo de configuração

# Aguarde até terminar (pode levar 5-10 minutos)
```

### O que fazer se o script pedir confirmação:

```bash
# Se pedir "Do you want to continue? [Y/n]"
# Digite: Y
# Pressione: Enter

# Se pedir senha do root
# Digite sua senha de sudo
# Pressione: Enter
```

---

## 📝 PASSO 5: Configurar Variáveis de Ambiente

Após o script terminar, você precisa editar o arquivo `.env`:

```bash
# Edite o arquivo de configuração
sudo nano /opt/isp_noc_system/.env

# Você verá um arquivo com muitas variáveis
# Edite as seguintes (as mais importantes):
```

### Variáveis Obrigatórias para Editar:

```env
# 1. DATABASE_URL
# Procure por: DATABASE_URL=
# Deixe como está (o script já configurou)
DATABASE_URL="mysql://isp_noc_user:sua_senha_gerada@localhost:3306/isp_noc_db"

# 2. JWT_SECRET
# Procure por: JWT_SECRET=
# Deixe como está (o script já gerou uma chave segura)
JWT_SECRET=sua_chave_gerada_automaticamente

# 3. VITE_APP_ID
# Procure por: VITE_APP_ID=
# Substitua por seu ID (obtenha em https://manus.im)
VITE_APP_ID=seu_app_id_aqui

# 4. OAUTH_SERVER_URL
# Deixe como está
OAUTH_SERVER_URL=https://api.manus.im

# 5. VITE_OAUTH_PORTAL_URL
# Deixe como está
VITE_OAUTH_PORTAL_URL=https://login.manus.im

# 6. OWNER_OPEN_ID
# Substitua por seu ID do Manus
OWNER_OPEN_ID=seu_owner_id_aqui

# 7. OWNER_NAME
# Substitua por seu nome
OWNER_NAME="Seu Nome Aqui"

# 8. BUILT_IN_FORGE_API_KEY
# Substitua pela sua chave API
BUILT_IN_FORGE_API_KEY=sua_chave_api_aqui

# 9. VITE_FRONTEND_FORGE_API_KEY
# Substitua pela sua chave frontend
VITE_FRONTEND_FORGE_API_KEY=sua_chave_frontend_aqui

# 10. VITE_APP_TITLE
# Pode deixar como está ou personalizar
VITE_APP_TITLE="ISP NOC System"
```

### Como Editar no Nano:

```bash
# 1. Use Ctrl+W para buscar uma variável
# Pressione: Ctrl+W
# Digite: VITE_APP_ID
# Pressione: Enter

# 2. Edite o valor
# Use setas para navegar
# Delete para apagar
# Digite o novo valor

# 3. Repita para cada variável que precisa editar

# 4. Salve o arquivo
# Pressione: Ctrl+O
# Pressione: Enter
# Pressione: Ctrl+X para sair
```

---

## 🏗️ PASSO 6: Build da Aplicação

Agora vamos compilar a aplicação:

```bash
# Vá para o diretório da aplicação
cd /opt/isp_noc_system

# Instale as dependências
sudo -u appuser pnpm install

# Isso vai levar alguns minutos...
# Você verá muitas linhas de output
# Aguarde até terminar

# Compile a aplicação
sudo -u appuser pnpm build

# Você verá:
# vite v7.1.9 building for production...
# ✓ built in X.XXs
# ⚡ Done in Xms

# Se tudo correu bem, você verá "Done"
```

---

## ✅ PASSO 7: Iniciar a Aplicação

```bash
# Inicie o serviço
sudo systemctl start isp_noc_system

# Ative para iniciar automaticamente no boot
sudo systemctl enable isp_noc_system

# Verifique o status
sudo systemctl status isp_noc_system

# Você deve ver:
# ● isp_noc_system.service - ISP NOC System
#    Loaded: loaded (/etc/systemd/system/isp_noc_system.service; enabled; vendor preset: enabled)
#    Active: active (running) since ...
```

---

## 🌐 PASSO 8: Acessar a Aplicação

Agora você pode acessar o sistema!

### Opção 1: Pelo IP do Servidor

```
http://seu_servidor_ip
```

Exemplo:
```
http://192.168.1.100
```

### Opção 2: Pelo Domínio (se configurado)

```
http://seu-dominio.com
```

### Opção 3: Pelo SSH (teste local)

```bash
# No servidor, teste localmente
curl http://localhost:3000

# Você deve ver o HTML da aplicação
```

---

## 🔍 PASSO 9: Verificar se Tudo Está Funcionando

### 9.1 Verificar Logs da Aplicação

```bash
# Ver logs em tempo real
sudo journalctl -u isp_noc_system -f

# Você deve ver:
# [OAuth] Initialized with baseURL: https://api.manus.im
# Server running on http://localhost:3000/

# Pressione Ctrl+C para sair
```

### 9.2 Verificar Banco de Dados

```bash
# Conecte ao banco de dados
mysql -u isp_noc_user -p isp_noc_db

# Digite a senha (o script gerou uma)
# Se conectar com sucesso, você verá:
# MariaDB [isp_noc_db]>

# Verifique as tabelas
SHOW TABLES;

# Você deve ver:
# +------------------------+
# | Tables_in_isp_noc_db   |
# +------------------------+
# | users                  |
# | pops                   |
# | equipamentos           |
# | ... (mais tabelas)     |
# +------------------------+

# Saia do MySQL
exit
```

### 9.3 Verificar Nginx

```bash
# Verifique o status do Nginx
sudo systemctl status nginx

# Você deve ver:
# ● nginx.service - A high performance web server and a reverse proxy server
#    Active: active (running)
```

---

## 🔐 PASSO 10: Configurar HTTPS (Opcional mas Recomendado)

Se você tem um domínio, configure HTTPS com Let's Encrypt:

```bash
# Instale Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Gere o certificado (substitua seu-dominio.com)
sudo certbot certonly --nginx -d seu-dominio.com

# Siga as instruções na tela
# Digite seu email
# Aceite os termos

# Após gerar, edite o Nginx
sudo nano /etc/nginx/sites-available/isp_noc_system

# Adicione as linhas de SSL (veja DEPLOYMENT_UBUNTU.md para exemplo completo)

# Teste a configuração
sudo nginx -t

# Reinicie o Nginx
sudo systemctl restart nginx
```

---

## 📊 PASSO 11: Fazer Login

Agora você pode fazer login!

### 11.1 Acessar a Página de Login

```
Abra seu navegador e vá para:
http://seu_servidor_ip
```

Você verá uma página de login profissional com:
- Logo do ISP NOC System
- Botão "Fazer Login com Manus"
- Informações do sistema

### 11.2 Fazer Login

```
1. Clique no botão "Fazer Login com Manus"
2. Você será redirecionado para o portal Manus
3. Faça login com suas credenciais
4. Você será redirecionado de volta para o Dashboard
```

---

## 🛠️ PASSO 12: Comandos Úteis para Depois

Guarde estes comandos para usar depois:

### Ver Status da Aplicação

```bash
sudo systemctl status isp_noc_system
```

### Ver Logs em Tempo Real

```bash
sudo journalctl -u isp_noc_system -f
```

### Reiniciar a Aplicação

```bash
sudo systemctl restart isp_noc_system
```

### Parar a Aplicação

```bash
sudo systemctl stop isp_noc_system
```

### Iniciar a Aplicação

```bash
sudo systemctl start isp_noc_system
```

### Ver Logs do Nginx

```bash
sudo tail -f /var/log/nginx/error.log
```

### Fazer Backup do Banco de Dados

```bash
mysqldump -u isp_noc_user -p isp_noc_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar Banco de Dados

```bash
mysql -u isp_noc_user -p isp_noc_db < backup_20260312_120000.sql
```

---

## 🆘 TROUBLESHOOTING - Soluções para Problemas Comuns

### Problema 1: "Connection refused" ao acessar

```bash
# Verifique se a aplicação está rodando
sudo systemctl status isp_noc_system

# Se não estiver, inicie
sudo systemctl start isp_noc_system

# Verifique os logs
sudo journalctl -u isp_noc_system -n 50
```

### Problema 2: "502 Bad Gateway" do Nginx

```bash
# Verifique se a aplicação está rodando
pm2 status

# Se não estiver, reinicie
sudo systemctl restart isp_noc_system

# Verifique se a porta 3000 está em uso
sudo lsof -i :3000
```

### Problema 3: Erro de conexão com banco de dados

```bash
# Verifique se MariaDB está rodando
sudo systemctl status mariadb

# Se não estiver, inicie
sudo systemctl start mariadb

# Teste a conexão
mysql -u isp_noc_user -p isp_noc_db -e "SELECT 1;"
```

### Problema 4: Erro de permissão

```bash
# Corrija as permissões
sudo chown -R appuser:appuser /opt/isp_noc_system
sudo chmod -R 755 /opt/isp_noc_system
```

### Problema 5: Porta 80 já em uso

```bash
# Verifique qual processo está usando
sudo lsof -i :80

# Mate o processo (substitua PID)
sudo kill -9 PID

# Reinicie o Nginx
sudo systemctl restart nginx
```

---

## 📈 Próximos Passos Após Deploy

1. **Testar a aplicação**
   - Fazer login
   - Adicionar alguns equipamentos
   - Verificar se tudo está funcionando

2. **Configurar backups automáticos**
   - Adicionar cron job para backup diário do banco

3. **Configurar monitoramento**
   - Instalar ferramentas como Zabbix ou Prometheus

4. **Adicionar usuários**
   - Criar usuários admin e operadores

5. **Documentar a configuração**
   - Guardar senhas em local seguro
   - Documentar IPs e portas

---

## 📞 Suporte Rápido

Se algo não funcionar:

1. **Verifique os logs:**
   ```bash
   sudo journalctl -u isp_noc_system -f
   ```

2. **Verifique a conexão com o banco:**
   ```bash
   mysql -u isp_noc_user -p isp_noc_db -e "SELECT 1;"
   ```

3. **Verifique o Nginx:**
   ```bash
   sudo nginx -t
   ```

4. **Reinicie tudo:**
   ```bash
   sudo systemctl restart isp_noc_system nginx mariadb
   ```

---

## ✅ Checklist Final

- [ ] Arquivos copiados para /tmp/isp_noc_system
- [ ] Script deploy.sh executado com sucesso
- [ ] Arquivo .env editado com suas configurações
- [ ] pnpm install executado
- [ ] pnpm build executado com sucesso
- [ ] Serviço iniciado: sudo systemctl start isp_noc_system
- [ ] Aplicação acessível em http://seu_servidor_ip
- [ ] Banco de dados conectando corretamente
- [ ] Nginx respondendo corretamente
- [ ] Você conseguiu fazer login

Se todos os itens estão marcados, seu deploy foi bem-sucedido! 🎉

---

**Versão:** 1.0.0  
**Data:** 2026-03-12  
**Status:** Pronto para Produção
