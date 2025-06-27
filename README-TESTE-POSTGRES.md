# Teste de Conexão PostgreSQL

Este conjunto de scripts testa a conexão com o banco de dados PostgreSQL hospedado na AWS RDS.

## Configurações do Banco

- **Host**: segtrackdb.cyv2oismclv3.us-east-1.rds.amazonaws.com
- **Porta**: 5432
- **Usuário**: postgres
- **Senha**: %t%E6G_$
- **Banco**: segtrackdb

## Scripts Disponíveis

### 1. `test-postgres-connection.js` - Teste Básico
Script simples para teste rápido de conexão.

```bash
node test-postgres-connection.js
```

### 2. `test-postgres-connection-enhanced.js` - Teste Avançado
Versão com mais diagnósticos, timeout aumentado e informações detalhadas.

```bash
node test-postgres-connection-enhanced.js
```

### 3. `test-postgres-ssl.js` - Teste com SSL
Testa conexão com SSL habilitado (comum em RDS).

```bash
node test-postgres-ssl.js
```

### 4. `diagnostico-completo.js` - Diagnóstico Completo ⭐
**RECOMENDADO** - Testa múltiplas configurações automaticamente.

```bash
node diagnostico-completo.js
```

## Como Usar

### 1. Verificar se a biblioteca pg está instalada

```bash
# No Linux/Mac
chmod +x install-pg.sh
./install-pg.sh

# No Windows (PowerShell)
npm list pg
```

### 2. Executar o diagnóstico completo (recomendado)

```bash
node diagnostico-completo.js
```

Este script irá:
- Testar resolução DNS
- Testar 4 configurações diferentes
- Fornecer resumo detalhado
- Sugerir soluções baseadas nos erros

## Resultados Esperados

### ✅ Conexão Bem-sucedida
```
🔍 DIAGNÓSTICO COMPLETO - CONEXÃO POSTGRESQL AWS RDS
=====================================================

🌐 Testando resolução DNS...
✅ DNS resolvido: XX.XX.XX.XX

📡 Testando: Configuração 1: Sem SSL
──────────────────────────────────────────────────
✅ SUCESSO em 1234ms
   Query teste: 1

📊 RESUMO DOS TESTES
====================
✅ Sucessos: 1/4
❌ Falhas: 3/4

🎉 CONFIGURAÇÃO FUNCIONAL ENCONTRADA!
   - Configuração 1: Sem SSL (1234ms)
```

### ❌ Erro de Conexão
```
❌ FALHA: timeout expired
   Código: N/A

🔧 NENHUMA CONFIGURAÇÃO FUNCIONOU

Verificações necessárias:
   1. RDS está rodando?
   2. Security Group permite porta 5432?
   3. IP de origem está liberado?
   4. Credenciais estão corretas?
   5. Banco "segtrackdb" existe?
```

## Troubleshooting

### Problemas Comuns

1. **Timeout**: 
   - Verificar conectividade de rede
   - Verificar se o RDS está acessível
   - Tentar com SSL habilitado

2. **ECONNREFUSED**: 
   - Verificar se o RDS está rodando
   - Verificar se a porta 5432 está aberta no Security Group
   - Verificar se o IP de origem está liberado

3. **ENOTFOUND**: 
   - Verificar se o hostname está correto
   - Verificar conectividade de rede

4. **password authentication failed**: 
   - Verificar usuário e senha
   - Verificar se o usuário tem permissão de acesso

5. **database does not exist**: 
   - Verificar se o nome do banco está correto
   - Verificar se o banco foi criado

### Verificações de Segurança AWS

- **Security Group**: Certifique-se de que permite conexões na porta 5432
- **IP de Origem**: Verifique se o IP está liberado no Security Group
- **RDS Status**: Confirme se a instância RDS está "Available"
- **VPC**: Verifique se está na VPC correta e com route tables adequadas

### Comandos de Diagnóstico Adicional

```bash
# Testar conectividade básica
ping segtrackdb.cyv2oismclv3.us-east-1.rds.amazonaws.com

# Testar porta (Windows)
telnet segtrackdb.cyv2oismclv3.us-east-1.rds.amazonaws.com 5432

# Testar porta (Linux/Mac)
nc -zv segtrackdb.cyv2oismclv3.us-east-1.rds.amazonaws.com 5432

# Verificar rotas
traceroute segtrackdb.cyv2oismclv3.us-east-1.rds.amazonaws.com
```

## Dependências

- Node.js >= 18.0.0
- Biblioteca `pg` (já incluída no package.json)

## Ordem de Execução Recomendada

1. `node diagnostico-completo.js` - Para diagnóstico completo
2. Se falhar, verificar configurações AWS
3. Se necessário, executar `node test-postgres-ssl.js` para testar SSL
4. Usar `node test-postgres-connection-enhanced.js` para mais detalhes 