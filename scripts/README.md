# Scripts do Backend

Este diretório contém scripts utilitários para o backend do SEGTRACK.

## Scripts Disponíveis

### fixAdminPermissions.ts
Atualiza as permissões do usuário admin (`admin@segtrack.com`) com todas as permissões necessárias.

**Permissões incluídas:**
- **User**: create, read, update, delete
- **Client**: create, read, update, delete  
- **Ocorrencia**: create, read, update, delete
- **Prestador**: create, read, update, delete
- **Relatorio**: create, read, update, delete
- **Contrato**: create, read, update, delete
- **Dashboard**: read
- **Foto**: upload, create, read, update, delete

**Como executar:**
```bash
# Usando npm script
npm run fix:admin-permissions

# Ou diretamente com ts-node
npx ts-node scripts/fixAdminPermissions.ts
```

### fix-admin-permissions-prod.ts
Script para produção que atualiza permissões de múltiplos usuários admin.

### create-admin.ts
Cria um novo usuário administrador no sistema.

## Estrutura dos Scripts

Todos os scripts seguem o padrão:
1. Importam o PrismaClient
2. Definem as configurações necessárias
3. Executam a lógica principal
4. Fecham a conexão com o banco
5. Incluem logs detalhados para acompanhamento

## Logs

Os scripts incluem logs coloridos e emojis para facilitar o acompanhamento:
- 🔍 Verificando...
- ✅ Sucesso
- ❌ Erro
- 📋 Informações
- 🔌 Conexão fechada 