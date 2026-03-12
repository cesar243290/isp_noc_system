# ISP NOC System - Guia de Comandos para Deploy

Copie e cole cada comando na sequência. Não pule nenhum!

---

## 🎯 RESUMO RÁPIDO

Se você quer apenas os comandos sem explicações, execute na sequência:

```bash
# 1. SSH para o servidor
ssh seu_usuario@seu_servidor_ip

# 2. Copiar arquivos (do seu computador)
scp -r isp_noc_system/ seu_usuario@seu_servidor_ip:/tmp/

# 3. Executar deployment
cd /tmp/isp_noc_system
sudo bash deploy.sh

# 4. Editar configuração
sudo nano /opt/isp_noc_system/.env

# 5. Build e deploy
cd /opt/isp_noc_system
sudo -u appuser pnpm install
sudo -u appuser pnpm build
sudo systemctl start isp_noc_system

# 6. Acessar
# Abra no navegador: http://seu_servidor_ip
```

---

## 📝 GUIA COMPLETO COM EXPLICAÇÕES

### PASSO 1: Preparar Computador Local

**O que fazer:** Verifique se os arquivos estão no seu computador

```bash
# Execute no seu computador (NÃO no servidor)
cd ~/isp_noc_system

# Verifique se os arquivos existem
ls -la

# Você deve ver:
# drwxr-xr-x  client
# drwxr-xr-x  server
# drwxr-xr-x  drizzle
# -rwxr-xr-x  deploy.sh
# -rw-r--r--  package.json
# etc...
```

---

### PASSO 2: Transferir Arquivos para o Servidor

**O que fazer:** Copie os arquivos do seu computador para o servidor

```bash
# Execute no seu computador (NÃO no servidor)
# Substitua "seu_usuario" e "seu_servidor_ip" pelos seus dados

scp -r isp_noc_system/ seu_usuario@seu_servidor_ip:/tmp/

# Exemplo real:
# scp -r isp_noc_system/ ubuntu@192.168.1.100:/tmp/

# Isso vai copiar toda a pasta
# Pode levar alguns minutos
# Aguarde até ver: "100%"
```

---

### PASSO 3: Conectar ao Servidor

**O que fazer:** Abra uma conexão SSH com o servidor

```bash
# Execute no seu computador
ssh seu_usuario@seu_servidor_ip

# Exemplo real:
# ssh ubuntu@192.168.1.100

# Digite a senha quando pedir
# Você deve ver algo como:
# ubuntu@servidor:~$
```

---

### PASSO 4: Verificar Arquivos no Servidor

**O que fazer:** Confirme que os arquivos chegaram

```bash
# Execute no servidor (você já está conectado via SSH)

# Verifique se os arquivos estão em /tmp
ls -la /tmp/isp_noc_system/

# Você deve ver:
# drwxr-xr-x  client
# drwxr-xr-x  server
# -rwxr-xr-x  deploy.sh
# etc...

# Se não ver, volte ao PASSO 2 e tente novamente
```

---

### PASSO 5: Executar Script de Deployment

**O que fazer:** Execute o script que faz toda a configuração

```bash
# Execute no servidor

# Vá para o diretório
cd /tmp/isp_noc_system

# Verifique se o script existe
ls -la deploy.sh

# Execute o script
sudo bash deploy.sh

# Você verá muitas linhas de output
# O script vai:
# - Atualizar pacotes
# - Instalar Node.js
# - Instalar MariaDB
# - Instalar Nginx
# - Instalar PM2
# - Criar banco de dados
# - Criar serviço systemd

# Aguarde até ver:
# =========================================
# Deployment Setup Complete!
# =========================================

# Se pedir confirmação, digite: Y
# Se pedir senha, digite sua senha de sudo
```

---

### PASSO 6: Editar Arquivo de Configuração

**O que fazer:** Configure as variáveis de ambiente

```bash
# Execute no servidor

# Abra o editor
sudo nano /opt/isp_noc_system/.env

# Você verá um arquivo com muitas linhas
# Procure por cada variável abaixo e edite

# IMPORTANTE: Use Ctrl+W para buscar
# Digite o nome da variável
# Pressione Enter para encontrar

# Edite estas variáveis:

# 1. VITE_APP_ID
# Busque: VITE_APP_ID=
# Mude para: VITE_APP_ID=seu_app_id_do_manus

# 2. OWNER_OPEN_ID
# Busque: OWNER_OPEN_ID=
# Mude para: OWNER_OPEN_ID=seu_owner_id_do_manus

# 3. OWNER_NAME
# Busque: OWNER_NAME=
# Mude para: OWNER_NAME="Seu Nome Completo"

# 4. BUILT_IN_FORGE_API_KEY
# Busque: BUILT_IN_FORGE_API_KEY=
# Mude para: BUILT_IN_FORGE_API_KEY=sua_chave_api

# 5. VITE_FRONTEND_FORGE_API_KEY
# Busque: VITE_FRONTEND_FORGE_API_KEY=
# Mude para: VITE_FRONTEND_FORGE_API_KEY=sua_chave_frontend

# Após editar tudo:
# Pressione: Ctrl+O
# Pressione: Enter
# Pressione: Ctrl+X
```

---

### PASSO 7: Instalar Dependências

**O que fazer:** Baixe e instale todas as bibliotecas necessárias

```bash
# Execute no servidor

# Vá para o diretório da aplicação
cd /opt/isp_noc_system

# Instale as dependências
sudo -u appuser pnpm install

# Você verá muitas linhas
# Isso pode levar alguns minutos
# Aguarde até ver:
# Done in X.XXs

# Se tudo correr bem, você verá "Done"
```

---

### PASSO 8: Compilar a Aplicação

**O que fazer:** Compile o código para produção

```bash
# Execute no servidor

# Você já deve estar em /opt/isp_noc_system
# Se não estiver, execute:
cd /opt/isp_noc_system

# Compile
sudo -u appuser pnpm build

# Você verá:
# vite v7.1.9 building for production...
# transforming...
# ✓ 2404 modules transformed.
# rendering chunks...
# ✓ built in X.XXs
# ⚡ Done in Xms

# Se tudo correr bem, você verá "Done"
```

---

### PASSO 9: Iniciar o Serviço

**O que fazer:** Inicie a aplicação

```bash
# Execute no servidor

# Inicie o serviço
sudo systemctl start isp_noc_system

# Ative para iniciar automaticamente
sudo systemctl enable isp_noc_system

# Verifique o status
sudo systemctl status isp_noc_system

# Você deve ver:
# ● isp_noc_system.service - ISP NOC System
#    Loaded: loaded (/etc/systemd/system/isp_noc_system.service; enabled)
#    Active: active (running)
#    ...

# Se ver "Active: active (running)", está funcionando!
```

---

### PASSO 10: Verificar Logs

**O que fazer:** Verifique se não há erros

```bash
# Execute no servidor

# Ver logs em tempo real
sudo journalctl -u isp_noc_system -f

# Você deve ver:
# [OAuth] Initialized with baseURL: https://api.manus.im
# Server running on http://localhost:3000/

# Se ver erros, pressione Ctrl+C e verifique o arquivo .env
```

---

### PASSO 11: Testar Banco de Dados

**O que fazer:** Verifique se o banco está funcionando

```bash
# Execute no servidor

# Conecte ao banco
mysql -u isp_noc_user -p isp_noc_db

# Digite a senha (o script gerou uma)
# Você deve ver:
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

# Saia
exit
```

---

### PASSO 12: Acessar a Aplicação

**O que fazer:** Abra no navegador

```bash
# No seu computador, abra o navegador
# Digite na barra de endereço:

http://seu_servidor_ip

# Exemplo:
# http://192.168.1.100

# Você deve ver a página de login do ISP NOC System
# Com o logo, botão "Fazer Login com Manus", etc.
```

---

### PASSO 13: Fazer Login

**O que fazer:** Teste o login

```bash
# No navegador:

1. Clique em "Fazer Login com Manus"
2. Você será redirecionado para o portal Manus
3. Faça login com suas credenciais
4. Você será redirecionado de volta para o Dashboard
5. Você deve ver o Dashboard com:
   - Sidebar com menu
   - Estatísticas
   - Gráficos
```

---

## 🆘 COMANDOS DE TROUBLESHOOTING

Se algo não funcionar, use estes comandos:

### Ver Status da Aplicação

```bash
sudo systemctl status isp_noc_system
```

### Ver Logs em Tempo Real

```bash
sudo journalctl -u isp_noc_system -f

# Pressione Ctrl+C para sair
```

### Ver Últimas 50 Linhas de Log

```bash
sudo journalctl -u isp_noc_system -n 50
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

### Verificar se Porta 3000 está em Uso

```bash
sudo lsof -i :3000
```

### Verificar Conexão com Banco

```bash
mysql -u isp_noc_user -p isp_noc_db -e "SELECT 1;"

# Digite a senha quando pedir
# Se funcionar, você verá:
# +---+
# | 1 |
# +---+
# | 1 |
# +---+
```

### Ver Status do MariaDB

```bash
sudo systemctl status mariadb
```

### Reiniciar MariaDB

```bash
sudo systemctl restart mariadb
```

### Ver Status do Nginx

```bash
sudo systemctl status nginx
```

### Testar Configuração do Nginx

```bash
sudo nginx -t

# Se tudo estiver OK, você verá:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Reiniciar Nginx

```bash
sudo systemctl restart nginx
```

### Ver Logs do Nginx

```bash
sudo tail -f /var/log/nginx/error.log
```

### Ver Permissões do Diretório

```bash
ls -la /opt/isp_noc_system/
```

### Corrigir Permissões

```bash
sudo chown -R appuser:appuser /opt/isp_noc_system
sudo chmod -R 755 /opt/isp_noc_system
```

---

## 🔄 COMANDOS ÚTEIS PARA DEPOIS

### Fazer Backup do Banco

```bash
mysqldump -u isp_noc_user -p isp_noc_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Digite a senha quando pedir
# Isso cria um arquivo: backup_20260312_120000.sql
```

### Restaurar Banco de Backup

```bash
mysql -u isp_noc_user -p isp_noc_db < backup_20260312_120000.sql

# Digite a senha quando pedir
```

### Atualizar Código (se estiver usando Git)

```bash
cd /opt/isp_noc_system
git pull origin main
sudo -u appuser pnpm install
sudo -u appuser pnpm build
sudo systemctl restart isp_noc_system
```

### Ver Espaço em Disco

```bash
df -h

# Você verá algo como:
# Filesystem      Size  Used Avail Use% Mounted on
# /dev/sda1        50G   20G   30G  40% /
```

### Ver Uso de Memória

```bash
free -h

# Você verá algo como:
#                total        used        free      shared  buff/cache   available
# Mem:           7.7Gi       2.0Gi       4.0Gi      100Mi       1.7Gi       5.3Gi
```

---

## 📊 CHECKLIST FINAL

Após completar todos os passos, verifique:

```bash
# 1. Aplicação rodando?
sudo systemctl status isp_noc_system
# Deve mostrar: Active: active (running)

# 2. Banco de dados conectando?
mysql -u isp_noc_user -p isp_noc_db -e "SELECT 1;"
# Deve mostrar: | 1 |

# 3. Nginx respondendo?
sudo systemctl status nginx
# Deve mostrar: Active: active (running)

# 4. Aplicação acessível?
curl http://localhost:3000
# Deve retornar HTML

# 5. Logs sem erros?
sudo journalctl -u isp_noc_system -n 20
# Não deve mostrar erros
```

---

**Se todos os comandos funcionaram, seu deploy foi bem-sucedido! 🎉**

Próximos passos:
1. Acessar http://seu_servidor_ip
2. Fazer login
3. Adicionar equipamentos e POPs
4. Configurar monitoramento
