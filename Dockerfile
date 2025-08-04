FROM node:22-slim

# Install OpenSSL for Prisma compatibility
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema and engine files
COPY prisma ./prisma

# Copy the rest of the application
COPY . .

# Run build step (includes prisma generate and nest build)
RUN npm run build


# Start the production application
CMD ["npm", "run", "start:prod"]
