# 🔧 SOLUÇÃO: Problema de Security Group AWS RDS

## 📊 Diagnóstico Realizado

Baseado nos testes executados, identificamos que:

- ✅ **DNS**: Resolvido corretamente para `23.23.181.188`
- ✅ **Host**: Acessível via ping
- ❌ **Porta 5432**: Bloqueada (ETIMEDOUT)

**Problema**: Security Group do RDS não permite conexões do seu IP na porta 5432.

## 🎯 Solução: Configurar Security Group

### Passo 1: Acessar AWS Console

1. Acesse [AWS Console](https://console.aws.amazon.com/)
2. Vá para **RDS** > **Databases**
3. Clique na instância `segtrackdb`

### Passo 2: Identificar Security Group

1. Na página da instância, vá para **Connectivity & security**
2. Clique no **VPC security groups** (será um link)
3. Isso abrirá o Security Group associado

### Passo 3: Adicionar Regra de Entrada

1. No Security Group, clique em **Inbound rules**
2. Clique em **Edit inbound rules**
3. Clique em **Add rule**
4. Configure:
   - **Type**: PostgreSQL
   - **Protocol**: TCP
   - **Port range**: 5432
   - **Source**: Seu IP atual (veja abaixo como descobrir)

### Passo 4: Descobrir Seu IP Atual

Execute este comando no PowerShell:

```powershell
Invoke-RestMethod -Uri "https://api.ipify.org"
```

Ou acesse: https://whatismyipaddress.com/

### Passo 5: Configurar IP no Security Group

**Opção A - IP Específico (Recomendado):**
- Source: `SEU_IP/32` (ex: `192.168.1.100/32`)

**Opção B - Temporário (Menos Seguro):**
- Source: `0.0.0.0/0` (permite qualquer IP)

### Passo 6: Salvar e Testar

1. Clique em **Save rules**
2. Aguarde alguns segundos
3. Execute o teste novamente:

```bash
node diagnostico-completo.js
```

## 🔍 Verificações Adicionais

### 1. Status da Instância RDS

Verifique se a instância está:
- **Status**: Available
- **Engine**: PostgreSQL
- **Endpoint**: segtrackdb.cyv2oismclv3.us-east-1.rds.amazonaws.com

### 2. VPC e Subnet

- Verifique se a instância está em uma VPC pública
- Confirme se as route tables permitem tráfego de saída

### 3. Teste de Conectividade

Após configurar o Security Group, execute:

```bash
# Teste básico de rede
node test-network-connectivity.js

# Teste completo de PostgreSQL
node diagnostico-completo.js
```

## 🚨 Problemas Comuns

### 1. IP Dinâmico
Se seu IP muda frequentemente:
- Configure um range maior (ex: `192.168.1.0/24`)
- Use VPN com IP fixo
- Configure apenas para desenvolvimento

### 2. Múltiplos Security Groups
- Verifique se há múltiplos Security Groups
- Confirme que todos permitem a porta 5432

### 3. Network ACLs
- Verifique se há Network ACLs bloqueando
- Confirme regras de entrada e saída

## ✅ Checklist de Verificação

- [ ] Security Group permite porta 5432
- [ ] IP de origem está liberado
- [ ] Instância RDS está "Available"
- [ ] Endpoint está correto
- [ ] Credenciais estão corretas
- [ ] Banco "segtrackdb" existe

## 🎉 Após Configurar

Quando o Security Group estiver configurado corretamente, você verá:

```
✅ SUCESSO em 1234ms
   Query teste: 1

🎉 CONFIGURAÇÃO FUNCIONAL ENCONTRADA!
```

## 📞 Suporte

Se o problema persistir após configurar o Security Group:

1. Verifique logs da instância RDS
2. Teste conectividade de outros locais
3. Considere usar AWS Systems Manager Session Manager para acesso interno
4. Verifique se há firewalls corporativos bloqueando

---

**Última atualização**: 26/06/2025
**Status**: Aguardando configuração do Security Group 