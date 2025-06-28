# Exemplo de .env para produção no Railway

```env
# Ambiente
NODE_ENV=production
PORT=3001

# Banco de dados PostgreSQL (Railway)
DATABASE_URL=postgresql://postgres:BBIosMGvETUoYSvAVqqWnwcxUSDhFeTeq@shortline.proxy.rlwy.net:15684/railway

# OBRIGATÓRIAS PARA O BACKEND FUNCIONAR NO RAILWAY
BASE_URL=https://segtrack-backend-production.up.railway.app
FRONTEND_URL=https://segtrack-frontend-production.up.railway.app
JWT_SECRET=uma_chave_bem_secreta_aqui_123456789
AWS_S3_BUCKET=nome-do-seu-bucket-s3
```

## Como usar

1. No painel do Railway, vá em **Settings > Variables** do seu backend.
2. Copie e cole cada variável acima, ajustando os valores conforme necessário (principalmente as URLs e o nome do bucket S3).
3. Clique em **Deploy** para aplicar as mudanças.

Se não usar S3, coloque um valor dummy em `AWS_S3_BUCKET` para passar a validação. 