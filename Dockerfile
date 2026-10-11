# Etapa 1: Compilación
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
# Ignorar conflictos de peer dependencies durante el build
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Etapa 2: Producción
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
# Ignorar conflictos de peer dependencies en producción
RUN npm install --omit=dev --legacy-peer-deps

COPY --from=build /app/dist ./dist

# Crear carpetas requeridas
RUN mkdir -p uploads/menu-items uploads/table-qrs

EXPOSE 8080
CMD ["node", "dist/main.js"]