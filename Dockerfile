# Build backend
FROM node:20 AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend .
RUN npm run build

# Build frontend
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend .
RUN npm run build

# Production image
FROM node:20-slim
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=frontend-build /app/frontend/dist ./dist/public
COPY backend/migrations ./migrations
COPY backend/migrate-config.js ./migrate-config.js
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENV NODE_ENV=production
ENV FRONTEND_PATH=/app/backend/dist/public
EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/app.js"]
