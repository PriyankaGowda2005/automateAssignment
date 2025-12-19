# Dockerfile for Playwright Test Automation
FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Install Playwright browsers
RUN npx playwright install --with-deps

# Copy test files and configuration
COPY . .

# Create necessary directories
RUN mkdir -p test-results logs allure-results allure-report

# Set environment variables
ENV CI=true
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Run tests
CMD ["npm", "test"]

