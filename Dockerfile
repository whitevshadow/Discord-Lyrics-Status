# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy ALL project files
COPY . .

# Build app
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production deps
RUN npm install --omit=dev

# Copy build output
COPY --from=builder /app/dist ./dist

# Copy static assets
COPY --from=builder /app/static ./static

# Copy resources if needed
COPY --from=builder /app/res ./res

# Expose app port
EXPOSE 8999

# Start app
CMD ["node", "dist/index.js"]
