# SEGTRACK Backend

## Atualização Importante: Tratamento de Conexão com Banco de Dados

Recentemente fizemos uma atualização importante no tratamento da conexão com o banco de dados para tornar o sistema mais robusto e seguro. As principais mudanças são:

### 1. Verificação de DATABASE_URL

O cliente Prisma agora verifica se a variável `DATABASE_URL` está definida antes de tentar se conectar ao banco. Se não estiver, ele retorna `null` ao invés de tentar criar uma conexão que falharia.

### 2. Nova Função `ensurePrisma()`

Para garantir que o prisma está disponível antes de usar, adicionamos uma nova função `ensurePrisma()`. Você deve usar esta função ao invés de acessar o cliente prisma diretamente.

Antes:
```typescript
const user = await prisma.user.findUnique({...});
```

Depois:
```typescript
const db = ensurePrisma();
const user = await db.user.findUnique({...});
```

### 3. Melhor Tratamento de Erros

- Adicionamos retry automático para operações do banco
- Melhoramos o logging de erros
- Adicionamos tipos mais precisos

### Como Atualizar Seu Código

1. Importe a função `ensurePrisma`:
```typescript
import { ensurePrisma } from '@/lib/prisma';
```

2. Use a função no início de cada operação do banco:
```typescript
try {
  const db = ensurePrisma();
  // Use db ao invés de prisma
  const result = await db.seuModelo.suaOperacao();
} catch (error) {
  logger.error('Mensagem de erro:', error);
  throw error;
}
```

3. Veja exemplos de uso em `src/examples/using-prisma.ts`

### Configuração do Ambiente

Certifique-se de ter as seguintes variáveis no seu arquivo `.env`:

```env
# Ambiente (development, production, test)
NODE_ENV=development

# URL do banco de dados
DATABASE_URL="mysql://user:password@localhost:3306/segtrack"

# Configurações JWT
JWT_SECRET=seu_secret_aqui
JWT_EXPIRATION=24h

# Porta do servidor
PORT=3001
```

### Scripts Disponíveis

- `npm run dev`: Inicia o servidor em modo de desenvolvimento
- `npm run build`: Compila o TypeScript
- `npm start`: Inicia o servidor em produção
- `npm run test`: Executa os testes
- `npm run migrate`: Executa as migrações do banco de dados
- `npm run seed`: Popula o banco com dados iniciais

### Logs e Monitoramento

O sistema agora usa um logger estruturado que facilita o debug e monitoramento. Os logs incluem:

- Operações do banco de dados (em desenvolvimento)
- Erros e exceções
- Métricas de performance
- Uso de memória
- Tentativas de autenticação

### Segurança

- Todas as senhas são hasheadas antes de salvar
- Implementamos rate limiting
- CORS configurado para origens específicas
- Headers de segurança via helmet
- Validação de dados de entrada

### Próximos Passos

- [ ] Implementar cache para queries frequentes
- [ ] Adicionar mais testes automatizados
- [ ] Melhorar documentação da API
- [ ] Implementar sistema de backup automático

## Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nome-da-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nome-da-feature`)
5. Crie um Pull Request

## Suporte

Se encontrar algum problema ou tiver dúvidas, por favor:

1. Verifique se há um issue similar
2. Crie um novo issue com uma descrição detalhada
3. Inclua logs relevantes e passos para reproduzir 