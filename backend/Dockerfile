# Use Node 24 LTS version
FROM node:24-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy backend source code
COPY . .

# Expose backend port
EXPOSE 5000

# Start backend
CMD ["node", "server.js"]
