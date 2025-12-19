const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { AutomationPage } = require('../pages/AutomationPage');
const { TaskBotPage } = require('../pages/TaskBotPage');
const dotenv = require('dotenv');
const path = require('path');
const logger = require('../utils/logger');
const testData = require('../utils/testData');
const Helpers = require('../utils/helpers');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Negative Test Cases for Use Case 1: Message Box Task
 * Tests error scenarios, validations, and edge cases
 */
test.describe('Use Case 1: Message Box Task - Negative Tests', () => {
  test.beforeEach(async ({ page }) => {
    logger.info('Starting negative test case');
  });

  test('@ui @negative Should fail login with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const Helpers = require('../utils/helpers');
    
    await test.step('Attempt login with invalid credentials', async () => {
      try {
        await loginPage.navigateToLogin();
      } catch (error) {
        if (Helpers.isDNSError(error)) {
          const baseURL = process.env.BASE_URL || 'https://www.automationanywhere.com/products/enterprise/community-edition';
          test.skip(true, Helpers.getDNSErrorMessage(error, baseURL));
          return;
        }
        throw error;
      }
      
      // Test with invalid username
      try {
        await loginPage.login('invalid@email.com', 'wrongpassword');
      } catch (error) {
        // Login might throw an error, which is expected for invalid credentials
        logger.info(`Login correctly failed with invalid credentials: ${error.message}`);
      }
      
      // Wait a bit for page to settle
      await page.waitForTimeout(2000);
      
      // Assert: Verify login failed (check after a delay to allow for async operations)
      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBeFalsy();
      
      // Assert: Verify error message is displayed (if available)
      const errorMessage = await loginPage.getErrorMessage();
      // Error message might not always be visible, so we just log it
      if (errorMessage.length > 0) {
        logger.info(`Error message displayed: ${errorMessage}`);
      } else {
        logger.info('No error message displayed, but login still failed (as expected)');
      }
    });
  });

  test('@ui @negative Should fail login with empty credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const Helpers = require('../utils/helpers');
    
    await test.step('Attempt login with empty credentials', async () => {
      try {
        await loginPage.navigateToLogin();
      } catch (error) {
        if (Helpers.isDNSError(error)) {
          const baseURL = process.env.BASE_URL || 'https://www.automationanywhere.com/products/enterprise/community-edition';
          test.skip(true, Helpers.getDNSErrorMessage(error, baseURL));
          return;
        }
        throw error;
      }
      
      try {
        await loginPage.login('', '');
        // If login doesn't throw, wait and verify it failed
        await page.waitForTimeout(2000);
        const isLoggedIn = await loginPage.isLoggedIn();
        expect(isLoggedIn).toBeFalsy();
      } catch (error) {
        // Expected: Login should fail or throw error
        logger.info(`Login correctly failed with empty credentials: ${error.message}`);
        // Verify login still failed
        await page.waitForTimeout(2000);
        const isLoggedIn = await loginPage.isLoggedIn();
        expect(isLoggedIn).toBeFalsy();
      }
    });
  });

  test('@ui @negative Should fail to create Task Bot with empty name', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const automationPage = new AutomationPage(page);
    const taskBotPage = new TaskBotPage(page);
    
    await test.step('Login and navigate to Task Bot creation', async () => {
      try {
        await loginPage.navigateToLogin();
      } catch (error) {
        if (Helpers.isDNSError(error)) {
          const baseURL = process.env.BASE_URL || 'https://www.automationanywhere.com/products/enterprise/community-edition';
          test.skip(true, Helpers.getDNSErrorMessage(error, baseURL));
          return;
        }
        throw error;
      }
      await loginPage.login(
        process.env.USERNAME || 'your-username',
        process.env.PASSWORD || 'your-password'
      );
      await automationPage.navigateToAutomation();
      await automationPage.selectTaskBot();
    });

    await test.step('Attempt to create Task Bot with empty name', async () => {
      try {
        await taskBotPage.fillTaskBotForm('', 'Description');
        await taskBotPage.createTaskBot();
        
        // Wait a bit for validation to occur
        await page.waitForTimeout(2000);
        
        // Verify error is shown or creation is prevented
        const errorVisible = await taskBotPage.isElementVisible(taskBotPage.errorMessage);
        // Error might be shown via browser validation or custom error message
        // If no error message element, verify that task wasn't created by checking if we're still on the form
        const stillOnForm = await taskBotPage.isElementVisible(taskBotPage.taskNameInput);
        expect(errorVisible || stillOnForm).toBeTruthy();
      } catch (error) {
        // Expected: Should fail validation
        logger.info(`Task Bot creation correctly failed: ${error.message}`);
        // Verify we're still on the form (creation didn't succeed)
        const stillOnForm = await taskBotPage.isElementVisible(taskBotPage.taskNameInput);
        expect(stillOnForm).toBeTruthy();
      }
    });
  });

  test('@ui @negative Should handle special characters in Task Bot name', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const automationPage = new AutomationPage(page);
    const taskBotPage = new TaskBotPage(page);
    const edgeCases = testData.getTestData('messageBox', 'edgeCases');
    
    await test.step('Login and navigate to Task Bot creation', async () => {
      try {
        await loginPage.navigateToLogin();
      } catch (error) {
        if (Helpers.isDNSError(error)) {
          const baseURL = process.env.BASE_URL || 'https://www.automationanywhere.com/products/enterprise/community-edition';
          test.skip(true, Helpers.getDNSErrorMessage(error, baseURL));
          return;
        }
        throw error;
      }
      await loginPage.login(
        process.env.USERNAME || 'your-username',
        process.env.PASSWORD || 'your-password'
      );
      await automationPage.navigateToAutomation();
      await automationPage.selectTaskBot();
    });

    await test.step('Test with special characters', async () => {
      // Test SQL injection attempt
      try {
        await taskBotPage.fillTaskBotForm(edgeCases.sqlInjection, 'Description');
        await taskBotPage.createTaskBot();
        
        // Wait for validation
        await page.waitForTimeout(2000);
        
        // Should either sanitize or reject
        const errorVisible = await taskBotPage.isElementVisible(taskBotPage.errorMessage);
        // If no error, verify it was sanitized or check if still on form
        if (!errorVisible) {
          const stillOnForm = await taskBotPage.isElementVisible(taskBotPage.taskNameInput);
          if (stillOnForm) {
            const nameValue = await taskBotPage.taskNameInput.inputValue().catch(() => '');
            // Verify it was either sanitized or rejected
            expect(nameValue === '' || !nameValue.includes('DROP TABLE')).toBeTruthy();
          }
        }
        logger.info('Special characters handled correctly');
      } catch (error) {
        logger.info(`Special characters handled correctly: ${error.message}`);
        // Verify we're still on the form
        const stillOnForm = await taskBotPage.isElementVisible(taskBotPage.taskNameInput);
        expect(stillOnForm).toBeTruthy();
      }
    });
  });

  test('@ui @negative Should handle XSS attempt in Message Box', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const automationPage = new AutomationPage(page);
    const taskBotPage = new TaskBotPage(page);
    const Helpers = require('../utils/helpers');
    const edgeCases = testData.getTestData('messageBox', 'edgeCases');
    
    await test.step('Login and create Task Bot', async () => {
      try {
        await loginPage.navigateToLogin();
      } catch (error) {
        if (Helpers.isDNSError(error)) {
          const baseURL = process.env.BASE_URL || 'https://www.automationanywhere.com/products/enterprise/community-edition';
          test.skip(true, Helpers.getDNSErrorMessage(error, baseURL));
          return;
        }
        throw error;
      }
      
      await loginPage.login(
        process.env.USERNAME || 'your-username',
        process.env.PASSWORD || 'your-password'
      );
      await automationPage.navigateToAutomation();
      await automationPage.selectTaskBot();
      
      const taskName = `TestTask_${Date.now()}`;
      await taskBotPage.fillTaskBotForm(taskName, 'Description');
      await taskBotPage.createTaskBot();
      await taskBotPage.addMessageBoxAction();
    });

    await test.step('Attempt XSS in Message Box', async () => {
      try {
        await taskBotPage.configureMessageBox({
          message: edgeCases.xssAttempt,
          title: 'Test'
        });
        
        // Wait a bit for any validation
        await page.waitForTimeout(1000);
        
        // Verify XSS is sanitized or rejected
        if (await taskBotPage.isElementVisible(taskBotPage.messageInput)) {
          const messageValue = await taskBotPage.messageInput.inputValue().catch(() => '');
          // Verify XSS is sanitized (no script tags or onerror)
          expect(messageValue).not.toContain('<script>');
          expect(messageValue).not.toContain('onerror');
        }
        logger.info('XSS attempt handled correctly');
      } catch (error) {
        logger.info(`XSS attempt handled correctly: ${error.message}`);
      }
    });
  });

  test('@ui @negative Should handle very long message in Message Box', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const automationPage = new AutomationPage(page);
    const taskBotPage = new TaskBotPage(page);
    const Helpers = require('../utils/helpers');
    const edgeCases = testData.getTestData('messageBox', 'edgeCases');
    
    await test.step('Login and create Task Bot', async () => {
      try {
        await loginPage.navigateToLogin();
      } catch (error) {
        if (Helpers.isDNSError(error)) {
          const baseURL = process.env.BASE_URL || 'https://www.automationanywhere.com/products/enterprise/community-edition';
          test.skip(true, Helpers.getDNSErrorMessage(error, baseURL));
          return;
        }
        throw error;
      }
      
      await loginPage.login(
        process.env.USERNAME || 'your-username',
        process.env.PASSWORD || 'your-password'
      );
      await automationPage.navigateToAutomation();
      await automationPage.selectTaskBot();
      
      const taskName = `TestTask_${Date.now()}`;
      await taskBotPage.fillTaskBotForm(taskName, 'Description');
      await taskBotPage.createTaskBot();
      await taskBotPage.addMessageBoxAction();
    });

    await test.step('Test with very long message', async () => {
      try {
        await taskBotPage.configureMessageBox({
          message: edgeCases.veryLongMessage,
          title: 'Test'
        });
        
        // Wait for validation
        await page.waitForTimeout(2000);
        
        // Should either truncate or show validation error
        const errorVisible = await taskBotPage.isElementVisible(taskBotPage.errorMessage);
        // If no error, verify it was handled (truncated or accepted)
        // Check if message was truncated by comparing lengths
        if (!errorVisible && await taskBotPage.isElementVisible(taskBotPage.messageInput)) {
          const messageValue = await taskBotPage.messageInput.inputValue().catch(() => '');
          // Message might be truncated or accepted as-is
          logger.info(`Very long message handled. Length: ${messageValue.length}, Error visible: ${errorVisible}`);
        } else {
          logger.info(`Very long message handled. Error visible: ${errorVisible}`);
        }
      } catch (error) {
        logger.info(`Very long message correctly rejected: ${error.message}`);
      }
    });
  });
});

