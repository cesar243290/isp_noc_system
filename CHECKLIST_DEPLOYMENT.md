# ISP NOC System - Checklist de Deployment

Use este checklist para acompanhar seu progresso durante o deployment.

## 📋 PRÉ-DEPLOYMENT

### Preparação Local

- [ ] Você tem os arquivos do ISP NOC System no seu computador
- [ ] Você tem acesso SSH ao servidor Ubuntu
- [ ] Você tem as credenciais Manus (VITE_APP_ID, OWNER_OPEN_ID, etc)
- [ ] Você testou a conexão SSH: `ssh seu_usuario@seu_servidor_ip`

### Informações do Servidor

Preencha estas informações:

```
IP do Servidor: _________________________________
Usuário SSH: ____________________________________
Senha SSH: ______________________________________
Domínio (opcional): _____________________________
```

---

## 🚀 DEPLOYMENT

### Passo 1: Transferir Arquivos

- [ ] Arquivos copiados para o servidor com SCP:
  ```bash
  scp -r isp_noc_system/ seu_usuario@seu_servidor_ip:/tmp/
  ```

- [ ] Verificar se arquivos chegaram:
  ```bash
  ssh seu_usuario@seu_servidor_ip
  ls -la /tmp/isp_noc_system/
  ```

### Passo 2: Executar Script de Deployment

- [ ] Conectado ao servidor via SSH
- [ ] Navegado para o diretório:
  ```bash
  cd /tmp/isp_noc_system
  ```

- [ ] Script de deployment executado:
  ```bash
  sudo bash deploy.sh
  ```

- [ ] Script completou com sucesso (aguardou 5-10 minutos)

**Informações do Deployment:**

```
Data/Hora de início: ____________________________
Data/Hora de término: ____________________________
Senha do MariaDB gerada: _________________________
```

### Passo 3: Configurar Variáveis de Ambiente

- [ ] Arquivo .env aberto:
  ```bash
  sudo nano /opt/isp_noc_system/.env
  ```

- [ ] Variáveis editadas:
  - [ ] VITE_APP_ID = ______________________________
  - [ ] OWNER_OPEN_ID = ____________________________
  - [ ] OWNER_NAME = _______________________________
  - [ ] BUILT_IN_FORGE_API_KEY = ___________________
  - [ ] VITE_FRONTEND_FORGE_API_KEY = ______________

- [ ] Arquivo salvo (Ctrl+O, Enter, Ctrl+X)

### Passo 4: Build da Aplicação

- [ ] Navegado para diretório:
  ```bash
  cd /opt/isp_noc_system
  ```

- [ ] Dependências instaladas:
  ```bash
  sudo -u appuser pnpm install
  ```
  Status: ✓ Completo / ✗ Erro

- [ ] Aplicação compilada:
  ```bash
  sudo -u appuser pnpm build
  ```
  Status: ✓ Completo / ✗ Erro

### Passo 5: Iniciar Serviço

- [ ] Serviço iniciado:
  ```bash
  sudo systemctl start isp_noc_system
  ```

- [ ] Serviço ativado para boot:
  ```bash
  sudo systemctl enable isp_noc_system
  ```

- [ ] Status verificado:
  ```bash
  sudo systemctl status isp_noc_system
  ```
  Status: ✓ Active (running) / ✗ Erro

---

## ✅ VERIFICAÇÃO

### Verificar Aplicação

- [ ] Logs verificados (sem erros):
  ```bash
  sudo journalctl -u isp_noc_system -n 20
  ```

- [ ] Aplicação respondendo localmente:
  ```bash
  curl http://localhost:3000
  ```
  Resultado: ✓ HTML recebido / ✗ Erro

### Verificar Banco de Dados

- [ ] Conexão com MariaDB:
  ```bash
  mysql -u isp_noc_user -p isp_noc_db -e "SELECT 1;"
  ```
  Resultado: ✓ Conectado / ✗ Erro

- [ ] Tabelas criadas:
  ```bash
  mysql -u isp_noc_user -p isp_noc_db -e "SHOW TABLES;"
  ```
  Resultado: ✓ Tabelas visíveis / ✗ Erro

### Verificar Nginx

- [ ] Status do Nginx:
  ```bash
  sudo systemctl status nginx
  ```
  Status: ✓ Active (running) / ✗ Erro

- [ ] Configuração válida:
  ```bash
  sudo nginx -t
  ```
  Resultado: ✓ OK / ✗ Erro

---

## 🌐 ACESSO

### Testar Acesso Remoto

- [ ] Aplicação acessível pelo IP:
  ```
  http://seu_servidor_ip
  ```
  Resultado: ✓ Página de login visível / ✗ Erro

- [ ] Página de login carrega corretamente:
  - [ ] Logo visível
  - [ ] Botão "Fazer Login com Manus" visível
  - [ ] Informações do sistema visíveis

### Fazer Login

- [ ] Clicou em "Fazer Login com Manus"
- [ ] Redirecionado para portal Manus
- [ ] Fez login com suas credenciais
- [ ] Redirecionado de volta para Dashboard
- [ ] Dashboard carregou corretamente:
  - [ ] Sidebar visível com menu
  - [ ] Estatísticas visíveis
  - [ ] Gráficos carregados

---

## 🔐 SEGURANÇA (Opcional)

### HTTPS com Let's Encrypt

- [ ] Certbot instalado:
  ```bash
  sudo apt-get install -y certbot python3-certbot-nginx
  ```

- [ ] Certificado gerado:
  ```bash
  sudo certbot certonly --nginx -d seu-dominio.com
  ```

- [ ] Nginx configurado com SSL
- [ ] HTTPS funcionando:
  ```
  https://seu-dominio.com
  ```

### Firewall

- [ ] Firewall ativado:
  ```bash
  sudo ufw enable
  ```

- [ ] Portas liberadas:
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  ```

---

## 📊 PÓS-DEPLOYMENT

### Testes Funcionais

- [ ] Adicionar novo equipamento
  - [ ] Preencher formulário
  - [ ] Salvar com sucesso
  - [ ] Equipamento aparece na lista

- [ ] Adicionar novo POP
  - [ ] Preencher formulário
  - [ ] Salvar com sucesso
  - [ ] POP aparece na lista

- [ ] Fazer logout
  - [ ] Clicou em logout
  - [ ] Redirecionado para página de login
  - [ ] Conseguiu fazer login novamente

### Monitoramento

- [ ] Verificar logs regularmente:
  ```bash
  sudo journalctl -u isp_noc_system -f
  ```

- [ ] Configurar backup automático do banco:
  ```bash
  crontab -e
  # Adicionar: 0 2 * * * mysqldump -u isp_noc_user -p'senha' isp_noc_db > /backups/isp_noc_db_$(date +\%Y\%m\%d).sql
  ```

- [ ] Documentar configuração
  - [ ] Guardar senhas em local seguro
  - [ ] Documentar IPs e portas
  - [ ] Documentar credenciais Manus

---

## 🆘 TROUBLESHOOTING

Se algo não funcionar, marque aqui:

### Problema 1: Aplicação não inicia

- [ ] Verificou logs:
  ```bash
  sudo journalctl -u isp_noc_system -n 50
  ```

- [ ] Verificou permissões:
  ```bash
  sudo chown -R appuser:appuser /opt/isp_noc_system
  ```

- [ ] Reiniciou serviço:
  ```bash
  sudo systemctl restart isp_noc_system
  ```

Resultado: ✓ Resolvido / ✗ Ainda com erro

### Problema 2: Erro 502 Bad Gateway

- [ ] Verificou se aplicação está rodando:
  ```bash
  pm2 status
  ```

- [ ] Verificou porta 3000:
  ```bash
  sudo lsof -i :3000
  ```

- [ ] Reiniciou Nginx:
  ```bash
  sudo systemctl restart nginx
  ```

Resultado: ✓ Resolvido / ✗ Ainda com erro

### Problema 3: Erro de conexão com banco

- [ ] Verificou se MariaDB está rodando:
  ```bash
  sudo systemctl status mariadb
  ```

- [ ] Testou conexão:
  ```bash
  mysql -u isp_noc_user -p isp_noc_db -e "SELECT 1;"
  ```

- [ ] Reiniciou MariaDB:
  ```bash
  sudo systemctl restart mariadb
  ```

Resultado: ✓ Resolvido / ✗ Ainda com erro

---

## 📝 Notas Importantes

```
Anotações durante o deployment:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## ✨ Status Final

**Data de Conclusão:** _____________________________

**Deployment Status:**
- [ ] ✓ Sucesso - Sistema rodando perfeitamente
- [ ] ⚠ Parcial - Sistema rodando com pequenos problemas
- [ ] ✗ Falha - Sistema não está funcionando

**Observações:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**Parabéns! Seu ISP NOC System está em produção! 🎉**

Para mais informações, consulte:
- DEPLOY_PASSO_A_PASSO.md
- DEPLOYMENT_UBUNTU.md
- QUICK_START.md
