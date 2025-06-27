# Use Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Copy dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy source code
COPY . .

# Build the project (both frontend and backend)
RUN yarn build

# Expose backend port
EXPOSE 3000

# Run the server
CMD ["node", "dist/index.js"]
