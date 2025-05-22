# Etapa 1: Imagem base para build com Node + dependências
FROM node:20 as build

# Cria pasta de trabalho
WORKDIR /app

# Copia os arquivos do projeto
COPY . .

# Instala dependências sem modificar package-lock.json
RUN npm ci

# Gera os arquivos TypeScript (./build)
RUN npm run build

# Etapa 2: Imagem leve para produção
FROM node:20-slim

WORKDIR /app

# Copia o projeto já buildado da imagem anterior
COPY --from=build /app .

# Define variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=8080

# Porta que o Cloud Run usará
EXPOSE 8080

# Comando de inicialização
CMD ["node", "build/index.js"]
