FROM node:18-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
    RUN npm install --only=production
# Copy source code
COPY src/ ./src/
    
    # Copy tests for CI/CD
    COPY test/ ./test/
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/healthz || exit 1

# Run as non-root user
USER node

EXPOSE 8080

CMD ["node", "src/index.js"]
