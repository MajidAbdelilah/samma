FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and TypeScript types
RUN npm install && \
    npm install --save-dev @types/react @types/node @types/react-dom

# Copy project files
COPY . .

# Set development environment
ENV NODE_ENV=development

# Expose port
EXPOSE 3000

# Start app in development mode
CMD ["npm", "run", "dev"] 