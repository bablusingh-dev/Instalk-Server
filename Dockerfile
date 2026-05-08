# ---------- Build Stage ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install all dependencies (including dev deps for TypeScript build)
RUN npm ci

# Copy source code
COPY server/ .

# Build TypeScript
RUN npm run build


# ---------- Production Stage ----------
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled build from builder
COPY --from=builder /app/dist ./dist

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose app port
EXPOSE 3000

# Start app
CMD ["node", "dist/index.js"]