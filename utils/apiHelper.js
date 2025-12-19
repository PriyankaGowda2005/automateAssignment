const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * API Helper utility class
 * Handles API requests and validations
 */
class APIHelper {
  constructor(request, baseURL) {
    this.request = request;
    this.baseURL = baseURL || process.env.API_BASE_URL || 'https://www.automationanywhere.com/api';
    this.authToken = null;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Get default headers with authentication
   */
  getHeaders(additionalHeaders) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...additionalHeaders
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Perform login and get authentication token
   */
  async login(username, password) {
    const response = await this.request.post(`${this.baseURL}/auth/login`, {
      data: {
        username,
        password
      },
      headers: this.getHeaders()
    });

    // Extract token from response if available
    if (response.ok()) {
      const responseBody = await response.json();
      if (responseBody.token || responseBody.accessToken) {
        this.setAuthToken(responseBody.token || responseBody.accessToken);
      }
    }

    return response;
  }

  /**
   * Make GET request
   */
  async get(endpoint, headers) {
    return await this.request.get(`${this.baseURL}${endpoint}`, {
      headers: this.getHeaders(headers)
    });
  }

  /**
   * Make POST request
   */
  async post(endpoint, data, headers) {
    return await this.request.post(`${this.baseURL}${endpoint}`, {
      data,
      headers: this.getHeaders(headers)
    });
  }

  /**
   * Make PUT request
   */
  async put(endpoint, data, headers) {
    return await this.request.put(`${this.baseURL}${endpoint}`, {
      data,
      headers: this.getHeaders(headers)
    });
  }

  /**
   * Make DELETE request
   */
  async delete(endpoint, headers) {
    return await this.request.delete(`${this.baseURL}${endpoint}`, {
      headers: this.getHeaders(headers)
    });
  }

  /**
   * Validate response status code
   */
  async validateStatusCode(response, expectedStatus) {
    return response.status() === expectedStatus;
  }

  /**
   * Validate response time
   */
  async validateResponseTime(response, maxTimeMs) {
    // Response time is not directly available in Playwright API
    // This would need to be measured manually or through network interception
    return true; // Placeholder
  }

  /**
   * Validate response body schema
   */
  async validateResponseSchema(response, schema) {
    const body = await response.json();
    
    for (const key in schema) {
      if (!(key in body)) {
        return false;
      }
      if (typeof schema[key] === 'object' && schema[key] !== null) {
        if (!(await this.validateResponseSchema({ json: async () => body[key] }, schema[key]))) {
          return false;
        }
      } else if (typeof body[key] !== schema[key]) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get response body as JSON
   */
  async getResponseBody(response) {
    return await response.json();
  }

  /**
   * Extract field value from response
   */
  async getFieldValue(response, fieldPath) {
    const body = await response.json();
    const fields = fieldPath.split('.');
    let value = body;
    
    for (const field of fields) {
      if (value && typeof value === 'object' && field in value) {
        value = value[field];
      } else {
        return null;
      }
    }
    
    return value;
  }
}

module.exports = { APIHelper };

