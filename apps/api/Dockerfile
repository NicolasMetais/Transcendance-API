FROM node:20

WORKDIR /app

# Copy package files first for better caching

COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY tsconfig.json ./
COPY .env ./
COPY src ./src

RUN npx tsc
# Expose port
EXPOSE 8443

# Start development server
RUN ls
CMD ["bash", "-c", "npx tsc && node dist/server.js"]