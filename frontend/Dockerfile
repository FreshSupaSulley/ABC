# Base Stage
FROM node:14 AS base

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the entire application code to the container
COPY . .

# Build the application
FROM base AS build
RUN npm run build

# Use an Nginx image to serve the frontend
FROM nginx:alpine
# Copy build output to nginx directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose the port NGINX runs on
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
