# Automation Everywhere - Test Automation Framework

This repository contains an automated testing framework for **Automation Anywhere Community Edition** using Playwright with JavaScript, following the Page Object Model (POM) design pattern.

**Repository**: [https://github.com/PriyankaGowda2005/automateAssignment.git](https://github.com/PriyankaGowda2005/automateAssignment.git)

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/PriyankaGowda2005/automateAssignment.git
cd automateAssignment

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install

# 4. Create .env file with your credentials
# (See Environment Variables section below)

# 5. Run tests
npm test
```

## 📋 Table of Contents

- [Overview](#overview)
- [Framework & Tools](#framework--tools)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Configuration](#configuration)
- [Test Execution](#test-execution)
- [Use Cases](#use-cases)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This framework automates three main use cases:

1. **Message Box Task (UI Automation)** - Create and configure a Message Box task
2. **Form with Upload Flow (UI Automation)** - Create a form with Textbox and File Upload controls
3. **Learning Instance API Flow (API Automation)** - Create and validate Learning Instances via API

## 🛠 Framework & Tools

### Core Technologies

- **Framework**: Playwright (v1.40.0+)
- **Language**: JavaScript (Node.js v16+)
- **Design Pattern**: Page Object Model (POM)
- **Test Runner**: Playwright Test
- **Package Manager**: npm

### Key Dependencies

- `@playwright/test` (^1.40.0) - Playwright testing framework
- `dotenv` (^16.3.1) - Environment variable management
- `winston` (^3.11.0) - Logging utility
- `allure-playwright` (^2.13.0) - Allure report integration

### Development Tools

- `eslint` - Code linting
- `prettier` - Code formatting

## 📁 Project Structure

```
AutomationEverywhere/
├── pages/                      # Page Object Model classes
│   ├── BasePage.js            # Base page with common methods
│   ├── LoginPage.js           # Login page interactions
│   ├── AutomationPage.js     # Automation section navigation
│   ├── TaskBotPage.js        # Task Bot creation and Message Box
│   ├── FormPage.js           # Form creation and file upload
│   └── LearningInstancePage.js # Learning Instance management
├── tests/                      # Test files
│   ├── use-case-1-message-box.spec.js
│   ├── use-case-2-form-upload.spec.js
│   └── use-case-3-learning-instance-api.spec.js
├── utils/                      # Utility classes
│   └── apiHelper.js           # API helper for API testing
├── test-files/                 # Test data files (created automatically)
│   └── test-document.txt      # Sample file for upload testing
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── package.json                # Project dependencies
├── playwright.config.js        # Playwright configuration
└── README.md                  # This file
```

## 📦 Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for version control)

## 🚀 Setup Instructions

### 1. Clone or Download the Repository

```bash
# If using Git
git clone https://github.com/PriyankaGowda2005/automateAssignment.git
cd AutomationEverywhere

# Or extract the zip file to AutomationEverywhere directory
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Playwright Browsers

```bash
npm run install:browsers
# Or
npx playwright install
```

### 4. Configure Environment Variables

1. Create a `.env` file in the root directory:

   ```bash
   # On Windows (PowerShell)
   New-Item -Path .env -ItemType File

   # On Linux/Mac
   touch .env
   ```

2. Add the following environment variables to your `.env` file:

   ```env
   # Automation Anywhere Community Edition Credentials
   USERNAME=your-actual-username
   PASSWORD=your-actual-password

   # Application URLs
   BASE_URL=https://community2.cloud-2.automationanywhere.digital
   API_BASE_URL=https://community2.cloud-2.automationanywhere.digital/api

   # Browser Configuration
   HEADLESS=false
   SLOW_MO=0
   ```

   **Important**: Replace `your-actual-username` and `your-actual-password` with your registered Automation Anywhere credentials.

### 5. Register on Automation Anywhere

1. Visit: https://www.automationanywhere.com/products/enterprise/community-edition
2. Register for an account
3. Update the `.env` file with your registered credentials

## ⚙️ Configuration

### Playwright Configuration

The `playwright.config.js` file contains:

- **Browser Support**: Chromium, Firefox, WebKit
- **Test Timeout**: 120 seconds per test
- **Action Timeout**: 60 seconds per action
- **Navigation Timeout**: 90 seconds
- **Screenshot & Video**: Captured on test failure
- **Base URL**: Configurable via `.env` file
- **Reporters**: HTML, List, JSON, Allure, JUnit
- **Workers**: Set to 1 (sequential execution) to avoid HTTP/2 protocol errors
- **Retries**: 1 retry locally, 2 retries on CI

### Test Configuration Notes

- Tests run **sequentially** (not in parallel) to prevent HTTP/2 protocol errors
- HTTP/2 is disabled in browser launch options for stability
- All tests include automatic retry logic for flaky network issues
- Screenshots and videos are automatically saved on failure in `test-results/` directory

## 🧪 Test Execution

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# Run only UI tests
npm run test:ui

# Run only API tests
npm run test:api
```

### Run Tests in Headed Mode (See Browser)

```bash
npm run test:headed
```

### Run Tests in Debug Mode

```bash
npm run test:debug
```

### Run Specific Test File

```bash
npx playwright test tests/use-case-1-message-box.spec.js
```

### Run Tests with Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### View Test Report

```bash
npm run test:report
```

This opens the HTML report in your browser showing:

- Test results
- Screenshots on failure
- Videos on failure
- Execution timeline

## 📝 Use Cases

### Use Case 1: Message Box Task (UI Automation)

**Test File**: `tests/use-case-1-message-box.spec.js`

**Steps Automated**:

1. Login to application
2. Navigate to Automation section
3. Create Task Bot
4. Add Message Box action
5. Verify all UI elements
6. Configure and save Message Box

**Assertions**:

- ✅ UI element visibility
- ✅ Proper data entry
- ✅ Successful creation
- ✅ Full functional flow validation

**Run Command**:

```bash
npx playwright test tests/use-case-1-message-box.spec.js
```

### Use Case 2: Form with Upload Flow (UI Automation)

**Test File**: `tests/use-case-2-form-upload.spec.js`

**Steps Automated**:

1. Login to application
2. Navigate to Automation section
3. Create Form
4. Add Textbox and File Upload elements
5. Verify UI interactions
6. Enter text and upload file
7. Save form and verify upload

**Assertions**:

- ✅ UI element visibility and functionality
- ✅ File upload status and confirmation
- ✅ Form submission behavior

**Run Command**:

```bash
npx playwright test tests/use-case-2-form-upload.spec.js
```

### Use Case 3: Learning Instance API Flow (API Automation)

**Test File**: `tests/use-case-3-learning-instance-api.spec.js`

**Steps Automated**:

1. Login via API
2. Navigate to Learning Instance (AI tab)
3. Create Learning Instance
4. Validate API responses

**Validations**:

- ✅ HTTP status code (200, 201)
- ✅ Response time (< 5 seconds)
- ✅ Response body schema
- ✅ Field-level checks (ID, name, status)
- ✅ Functional accuracy

**Run Command**:

```bash
npx playwright test tests/use-case-3-learning-instance-api.spec.js
```

## 🔐 Environment Variables

| Variable            | Description                          | Required | Default/Example                                    |
| ------------------- | ------------------------------------ | -------- | -------------------------------------------------- |
| `USERNAME`          | Automation Anywhere username         | ✅ Yes   | `your-username`                                    |
| `PASSWORD`          | Automation Anywhere password         | ✅ Yes   | `your-password`                                    |
| `BASE_URL`          | Application base URL                 | ✅ Yes   | `https://community2.cloud-2.automationanywhere.digital` |
| `API_BASE_URL`      | API base URL                         | ✅ Yes   | `https://community2.cloud-2.automationanywhere.digital/api` |
| `HEADLESS`          | Run browser in headless mode         | ❌ No    | `false` (set to `true` for CI/CD)                  |
| `SLOW_MO`           | Slow down operations (milliseconds)  | ❌ No    | `0` (increase for debugging)                       |

### Environment Configuration Notes

- **`.env` file is gitignored** - Never commit your actual credentials
- **BASE_URL** should not include hash routes (`#/login`) or query parameters
- **HEADLESS mode**: Set to `true` for CI/CD pipelines, `false` for local debugging
- **SLOW_MO**: Useful for debugging - slows down each action by specified milliseconds

## 🐛 Troubleshooting

### Common Issues

#### 1. Tests Fail with "Element not found"

**Solution**: The selectors may need to be updated based on the actual application structure. Use Playwright's codegen to generate selectors:

```bash
npx playwright codegen https://www.automationanywhere.com/products/enterprise/community-edition
```

#### 2. Login Fails

**Solution**:

- Verify credentials in `.env` file
- Ensure you're registered on the platform
- Check if the login page structure has changed

#### 3. API Tests Fail

**Solution**:

- Verify API endpoints in browser Network tab
- Update `API_BASE_URL` if different
- Check authentication token extraction logic

#### 4. File Upload Fails

**Solution**:

- Ensure `test-files` directory exists
- Check file path in test
- Verify file input selector

#### 5. Browsers Not Installed

**Solution**:

```bash
npx playwright install
```

### Debug Tips

1. **Run in headed mode** to see what's happening:

   ```bash
   npm run test:headed
   ```

2. **Use debug mode** to step through tests:

   ```bash
   npm run test:debug
   ```

3. **Check screenshots** in `test-results/screenshots/` on failure

4. **View videos** in `test-results/` on failure

5. **Use Playwright Inspector**:
   ```bash
   PWDEBUG=1 npx playwright test
   ```

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npm run test:report
```

Reports include:

- Test execution summary
- Pass/fail status
- Execution time
- Screenshots on failure
- Videos on failure
- Console logs

## 🔄 Updating Selectors

If the application UI changes, update selectors in the Page Object classes:

1. Use Playwright Inspector to identify elements
2. Update selectors in respective Page Object files
3. Re-run tests to verify

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [JavaScript Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)

## 📄 License

This project is for educational and testing purposes.

## 👤 Author

Automation Testing Framework for Automation Anywhere Community Edition

---

**Note**: This framework is designed to work with Automation Anywhere Community Edition. Selectors and API endpoints may need adjustment based on the actual application structure. Use browser developer tools and Network tab to identify correct selectors and API endpoints.
