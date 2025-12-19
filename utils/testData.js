const path = require('path');
const fs = require('fs');

/**
 * Test Data Management Utility
 * Manages test data separately from code for better maintainability
 */
class TestDataManager {
  constructor() {
    this.testDataPath = path.resolve(__dirname, '../test-data');
    this.ensureTestDataDirectory();
  }

  /**
   * Ensure test data directory exists
   */
  ensureTestDataDirectory() {
    if (!fs.existsSync(this.testDataPath)) {
      fs.mkdirSync(this.testDataPath, { recursive: true });
    }
  }

  /**
   * Load test data from JSON file
   * @param {string} fileName - Name of the JSON file (without extension)
   * @returns {Object} - Test data object
   */
  loadTestData(fileName) {
    try {
      const filePath = path.join(this.testDataPath, `${fileName}.json`);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Test data file not found: ${filePath}`);
      }
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error(`Error loading test data from ${fileName}:`, error.message);
      throw error;
    }
  }

  /**
   * Get test data for a specific test case
   * @param {string} testCase - Test case name
   * @param {string} dataKey - Key in the test data object
   * @returns {any} - Test data value
   */
  getTestData(testCase, dataKey) {
    const testData = this.loadTestData(testCase);
    if (!testData[dataKey]) {
      throw new Error(`Test data key "${dataKey}" not found in ${testCase}`);
    }
    return testData[dataKey];
  }

  /**
   * Generate dynamic test data
   * @param {string} prefix - Prefix for generated data
   * @returns {Object} - Generated test data
   */
  generateDynamicData(prefix = 'Test') {
    const timestamp = Date.now();
    return {
      name: `${prefix}_${timestamp}`,
      description: `Automated test data generated at ${new Date(timestamp).toISOString()}`,
      email: `test_${timestamp}@automation.com`,
      timestamp: timestamp
    };
  }
}

module.exports = new TestDataManager();

