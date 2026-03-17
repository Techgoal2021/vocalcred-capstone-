# syntax=docker/dockerfile:1

FROM node:20

WORKDIR /app

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1
# Ensure devDependencies are installed for building
ENV NODE_ENV development
ENV DATABASE_URL="file:./dev.db"

# Provide dummy AT credentials for build-time initialization
ENV AT_USERNAME="sandbox"
ENV AT_API_KEY="dummy"
ENV GEMINI_API_KEY="dummy"

# Install dependencies (includes devDependencies)
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Switch to production for runtime
ENV NODE_ENV production

# Start the application
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"]
