# Dockerfile for Metapharsic Todo (Full-stack)

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/metapharsic-frontend
COPY metapharsic-frontend/package*.json ./
RUN npm install
COPY metapharsic-frontend/ ./
RUN npm run build

# Stage 2: Setup Backend and App
FROM node:20-alpine
WORKDIR /app

# Create logs directory
RUN mkdir -p /app/logs

# Copy backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# Copy built frontend from Stage 1 to the location backend expects
WORKDIR /app
COPY --from=frontend-builder /app/metapharsic-frontend/dist ./metapharsic-frontend/dist

# Set environment variables (defaults)
ENV NODE_ENV=production
ENV PORT=3001
ENV DB_HOST=db
ENV DB_PORT=5432
ENV DB_USER=postgres
ENV DB_NAME=metapharsic_todo_db

# Expose the port
EXPOSE 3001

# Run the backend
WORKDIR /app/backend
CMD ["node", "server.js"]
