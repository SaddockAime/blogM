# Simple Dockerfile for BlogM
FROM node:18-alpine

# Create app user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY .sequelizerc ./

# Install dependencies (including dev dependencies for building)
RUN npm ci && npm cache clean --force

# Copy source code and scripts
COPY src/ ./src/
COPY scripts/ ./scripts/

# Build the application
RUN npm run build

# Create uploads directory and set permissions
RUN mkdir -p uploads && chown -R nodejs:nodejs /app

# Make start script executable
RUN chmod +x scripts/start.sh

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5500

# Start the application
CMD ["./scripts/start.sh"]
