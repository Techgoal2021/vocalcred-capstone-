# syntax=docker/dockerfile:1

FROM node:20

WORKDIR /app

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# User requested NODE_ENV=production
ENV NODE_ENV production
ENV DATABASE_URL="file:/app/dev.db"

# Provide dummy AT credentials for build-time initialization
ENV AT_USERNAME="sandbox"
ENV AT_API_KEY="dummy"
ENV GEMINI_API_KEY="dummy"

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --include=dev

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Start the application
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Auto-initialize database on startup and then start server
CMD npx prisma db push --accept-data-loss && npm start
