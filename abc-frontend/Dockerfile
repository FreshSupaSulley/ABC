# https://medium.com/@alinaseri/dockerize-react-applications-with-nginx-17f752deb54
# Build stage
FROM node:14 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

RUN npm install -g serve

# EXPOSE 80/tcp??
CMD ["serve", "-s", "build"]
