# Use Node.js LTS version
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Copie TODO o código, incluindo prisma, src, etc.
COPY . .

# Agora gere o client do Prisma
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8080

# Start the server
CMD [ "npm", "start" ]
