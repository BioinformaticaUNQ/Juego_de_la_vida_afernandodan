# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Construir el proyecto
RUN npm run build

# Etapa de producción
FROM node:20-alpine

WORKDIR /app

# Instalar servidor HTTP estático
RUN npm install -g serve

# Copiar archivos construidos desde la etapa anterior
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production

# Comando de inicio
CMD ["serve", "-s", "dist", "-l", "3000"]
