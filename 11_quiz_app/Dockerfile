# Multi-stage build for Quiz Application
# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY src ./src
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./

# Build frontend
RUN npm run build

# Stage 2: Build Python backend
FROM python:3.11-slim AS backend-builder

WORKDIR /app/backend

# Install dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Stage 3: Final runtime image
FROM python:3.11-slim

WORKDIR /app

# Install nginx for serving frontend and reverse proxy
RUN apt-get update && \
    apt-get install -y nginx && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy Python dependencies
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copy backend code
COPY backend /app/backend

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Copy connection.toml and private key
# Note: deploy.sh will create connection.docker.toml with updated paths
COPY connection.docker.toml /app/connection.toml
COPY snowflake_key.pem /app/snowflake_key.pem

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port (nginx)
EXPOSE 8080

# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Start backend API\n\
cd /app/backend\n\
uvicorn main:app --host 127.0.0.1 --port 8000 &\n\
\n\
# Start nginx\n\
nginx -g "daemon off;" &\n\
\n\
# Wait for any process to exit\n\
wait -n\n\
\n\
# Exit with status of process that exited first\n\
exit $?\n\
' > /app/start.sh && chmod +x /app/start.sh

# Run startup script
CMD ["/app/start.sh"]
