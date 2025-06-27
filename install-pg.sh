#!/bin/bash

echo "Verificando se a biblioteca pg está instalada..."

if npm list pg > /dev/null 2>&1; then
    echo "✅ Biblioteca pg já está instalada"
else
    echo "📦 Instalando biblioteca pg..."
    npm install pg
    echo "✅ Biblioteca pg instalada com sucesso"
fi

echo ""
echo "Para testar a conexão, execute:"
echo "node test-postgres-connection.js" 