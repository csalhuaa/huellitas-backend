# Huellitas Backend API

Backend API para PetFinder - Plataforma de búsqueda de mascotas perdidas con IA.

## 🚀 Tecnologías

* Node.js + Express
* PostgreSQL + PostGIS
* Knex.js (migraciones)
* Docker + Docker Compose
* Cloud Run (GCP)

## 📋 Prerrequisitos

* Node.js 18+
* Docker y Docker Compose
* PostgreSQL 16 con PostGIS (vía Docker)

## 🛠️ Instalación

1. **Clonar el repositorio**

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

3. **Copiar variables de entorno:**

   ```bash
   cp .env.example .env
   ```

4. **Levantar base de datos:**

   ```bash
   docker-compose up -d
   ```

5. **Ejecutar migraciones:**

   ```bash
   npm run migrate
   ```

6. **(Opcional) Cargar datos de prueba:**

   ```bash
   npm run seed
   ```

## 🏃 Ejecución

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm start
```

## 📝 Scripts Disponibles

* `npm run dev` - Inicia servidor en modo desarrollo (nodemon)
* `npm start` - Inicia servidor en modo producción
* `npm run migrate` - Ejecuta migraciones pendientes
* `npm run migrate:rollback` - Revierte última migración
* `npm run seed` - Carga datos de prueba
* `npm run lint` - Ejecuta ESLint
* `npm run lint:fix` - Corrige errores de ESLint
* `npm run format` - Formatea código con Prettier

## 🗂️ Estructura del Proyecto

Ver documentación completa en `/docs`

## 🔐 Autenticación

La API usa Firebase Authentication. Incluir token en header:

```http
Authorization: Bearer <firebase-token>
```

## 📡 Endpoints

### Health Check

* `GET /health` - Verificar estado del servidor

### Auth

* `POST /api/auth/register` - Registrar usuario
* `POST /api/auth/login` - Login

### (TODO: Documentar endpoints restantes)

## 🐳 Docker

### Build

```bash
docker build -t huellitas-backend .
```

### Run

```bash
docker run -p 8080:8080 --env-file .env huellitas-backend
```

## ☁️ Deploy en Cloud Run

```bash
gcloud run deploy huellitas-api \
  --source . \
  --region=us-central1 \
  --allow-unauthenticated
```
