# ========================
# Build Stage
# ========================
FROM node:18.20.0-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy full project
COPY . .

# ========================
# FRONTEND BUILD
# ========================
WORKDIR /app/frontend

# Declare frontend env variable for build-time use
ARG NEXT_PUBLIC_APP_URL=https://ayas-development-698852487711.asia-south1.run.app
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ARG NEXT_PUBLIC_API_BASE_URL=https://ayas-development-698852487711.asia-south1.run.app/api
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# Install frontend deps
RUN npm install --legacy-peer-deps --ignore-scripts
RUN npm run build:icons
RUN npx prisma generate
RUN npm run build

# ========================
# BACKEND BUILD
# ========================
WORKDIR /app/backend

# Install backend deps
RUN npm install --legacy-peer-deps
RUN npm run build

# ========================
# Production Stage
# ========================
FROM node:18.20.0-alpine

WORKDIR /app/backend

# Copy backend build
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package*.json ./

# Copy frontend build + config
COPY --from=builder /app/frontend/.next ../frontend/.next
COPY --from=builder /app/frontend/public ../frontend/public
COPY --from=builder /app/frontend/next.config.ts ../frontend/
COPY --from=builder /app/frontend/package*.json ../frontend/
COPY --from=builder /app/frontend/node_modules/.prisma ../frontend/node_modules/.prisma

# Install backend prod deps
RUN npm install --production --legacy-peer-deps

# Install frontend prod deps (Next.js needed at runtime)
WORKDIR /app/frontend
RUN npm install --production --legacy-peer-deps --ignore-scripts

# Expose for Cloud Run
EXPOSE 8080

# Start server
WORKDIR /app/backend/dist
CMD ["node", "server.js"]
