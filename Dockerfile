# Dockerfile - Frontend estático para Vercel
# Este Dockerfile é apenas para referência/testes locais
# Para produção, use Vercel diretamente: https://vercel.com

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app/client

# Copiar arquivos de dependência
COPY client/package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código-fonte
COPY client .

# Build da aplicação
RUN npm run build

# Stage final - Nginx para servir
FROM nginx:alpine

# Copiar build para Nginx
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Copiar configuração Nginx
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


# Copy only production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built server and client dist
COPY --from=builder /app/dist ./dist
COPY --from=client-builder /client/dist ./client/dist

# Copy DB file if exists in repo (you may mount a volume instead)
COPY financeiro.db ./financeiro.db

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["node", "dist/server.js"]
