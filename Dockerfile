FROM node:20-alpine

WORKDIR /app

# Copy the Frontend folder into /app
COPY Frontend/ ./

# Install dependencies
RUN npm install

# Build the Next.js app
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
