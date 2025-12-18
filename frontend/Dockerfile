# Build stage
FROM node:24-alpine AS build

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build output to Nginx html folder
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
