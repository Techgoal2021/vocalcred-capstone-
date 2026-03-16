# syntax=docker/dockerfile:1

FROM node:20

WORKDIR /app

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
ENV DATABASE_URL="file:./dev.db"

# Install dependencies first (for caching)
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application (ignore lint/TS for speed/safety)
RUN npm run build

# Start the application
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"]
