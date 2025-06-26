#!/bin/bash

# Atualizar sistema
sudo apt-get update
sudo apt-get upgrade -y

# Instalar MySQL
sudo apt-get install -y mysql-server

# Configurar MySQL para aceitar conexões externas
sudo sed -i 's/bind-address\s*=\s*127.0.0.1/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf

# Configurar segurança básica
sudo mysql_secure_installation

# Criar usuário e banco de dados
sudo mysql -e "CREATE DATABASE IF NOT EXISTS segtrack;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'segtrack_admin'@'%' IDENTIFIED BY 'sua_senha_aqui';"
sudo mysql -e "GRANT ALL PRIVILEGES ON segtrack.* TO 'segtrack_admin'@'%';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Configurar backup automático
sudo mkdir -p /var/backups/mysql
sudo chown mysql:mysql /var/backups/mysql

# Script de backup
cat << EOF > /usr/local/bin/mysql-backup.sh
#!/bin/bash
DATE=\$(date +%Y%m%d)
BACKUP_DIR="/var/backups/mysql"
mysqldump -u segtrack_admin -p'sua_senha_aqui' segtrack > \$BACKUP_DIR/segtrack_\$DATE.sql
find \$BACKUP_DIR -type f -name "*.sql" -mtime +7 -delete
EOF

# Tornar script executável
sudo chmod +x /usr/local/bin/mysql-backup.sh

# Adicionar ao crontab
echo "0 3 * * * /usr/local/bin/mysql-backup.sh" | sudo tee -a /var/spool/cron/crontabs/root

# Configurar monitoramento
echo '*/5 * * * * mysqladmin status >> /var/log/mysql/status.log' | sudo tee -a /var/spool/cron/crontabs/root

# Reiniciar MySQL
sudo systemctl restart mysql

# Mensagem de conclusão
echo "MySQL instalado e configurado!"
echo "Lembre-se de:"
echo "1. Alterar a senha do usuário segtrack_admin"
echo "2. Configurar o firewall para permitir apenas IPs necessários"
echo "3. Verificar os logs em /var/log/mysql/" 