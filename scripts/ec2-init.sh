#!/bin/bash

# Atualizar sistema
sudo apt-get update
sudo apt-get upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar dependências do sistema
sudo apt-get install -y git build-essential nginx

# Configurar Nginx
sudo tee /etc/nginx/sites-available/segtrack << EOF
server {
    listen 80;
    server_name api.painelsegtrack.com.br;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# Ativar site no Nginx
sudo ln -s /etc/nginx/sites-available/segtrack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Criar diretório da aplicação
mkdir -p /home/ubuntu/segtrack
cd /home/ubuntu/segtrack

# Clonar repositório (substitua pela URL do seu repositório)
# git clone seu-repositorio.git .

# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Construir aplicação
npm run build

# Configurar PM2
pm2 start dist/server.js --name segtrack
pm2 startup
pm2 save

# Configurar logs
sudo mkdir -p /var/log/segtrack
sudo chown -R ubuntu:ubuntu /var/log/segtrack

# Configurar monitoramento básico
echo '*/5 * * * * /usr/bin/free -m >> /var/log/segtrack/memory.log' | crontab -
echo '*/5 * * * * ps aux | grep node >> /var/log/segtrack/process.log' | crontab -

# Mensagem de conclusão
echo "Instalação concluída! Verifique os logs em /var/log/segtrack/" 