# Dockerfile
FROM node:18-alpine

# Instalar dependencias del sistema para node-gyp (por si acaso)
RUN apk add --no-cache python3 make g++

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluir devDependencies para build si es necesario)
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Cloud Run asigna PORT automáticamente (usualmente 8080)
# Tu app debe leer process.env.PORT
ENV NODE_ENV=production

# Health check (ahora usa /health en raíz)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + process.env.PORT + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar
CMD ["node", "src/server.js"]
