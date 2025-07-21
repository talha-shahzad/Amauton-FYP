# Use Node LTS
FROM node:18

# Create app directory
WORKDIR /app

# Copy dependencies and install
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port your app uses
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
