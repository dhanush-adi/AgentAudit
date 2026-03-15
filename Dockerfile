FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY .nvmrc .

# Copy Frontend
COPY Frontend/ ./Frontend/

# Install dependencies
RUN npm install

# Build
WORKDIR /app/Frontend
RUN npm run build

# Start
EXPOSE 3000
CMD ["npm", "start"]
