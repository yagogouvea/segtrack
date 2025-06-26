#!/bin/bash

# Carregar variaveis de ambiente
source ./backup.env

# Tornar scripts executaveis
chmod +x validate-aws.sh backup-completo.sh deploy-backup.sh

# Executar deploy
./deploy-backup.sh
