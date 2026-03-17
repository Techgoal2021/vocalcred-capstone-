# syntax=docker/dockerfile:1

# Stage 1: Install dependencies and build
FROM node:20 AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/dev.db"

# Provide dummy AT credentials for build-time initialization
ENV AT_USERNAME="sandbox"
ENV AT_API_KEY="dummy"
ENV GEMINI_API_KEY="dummy"

COPY package.json package-lock.json* ./
RUN npm install --include=dev

COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production runner
FROM node:20 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/app/dev.db"
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Copy build artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Ensure the database is writable
RUN touch /app/dev.db && chmod 666 /app/dev.db

EXPOSE 8080

# Auto-initialize database on startup and start the standalone server
# We use node server.js because of Next.js standalone output
CMD npx prisma db push --accept-data-loss && node server.js
