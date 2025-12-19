const { BasePage } = require('./BasePage');
const logger = require('../utils/logger');

/**
 * Learning Instance Page Object Model
 * Handles Learning Instance creation and management
 */
class LearningInstancePage extends BasePage {
  constructor(page) {
    super(page);
    // "Create Learning Instance" button (top right)
    this.createButton = page.locator(
      'button:has-text("Create Learning Instance"), ' +
      'button:has-text("Create"), ' +
      'button:has-text("New"), ' +
      '[aria-label*="Create Learning Instance" i], ' +
      '[aria-label*="Create" i], ' +
      'button[id*="create" i], ' +
      'button[class*="create" i]'
    ).first();
    
    // Form fields in the modal
    this.instanceNameInput = page.locator(
      'input[name*="name" i], ' +
      'input[id*="name" i], ' +
      'input[placeholder*="name" i], ' +
      'input[placeholder*="Name" i], ' +
      'input[aria-label*="name" i], ' +
      'label:has-text("Name") + input, ' +
      'label:has-text("Name") ~ input'
    ).first();
    
    this.instanceDescriptionInput = page.locator(
      'textarea[name*="description" i], ' +
      'textarea[id*="description" i], ' +
      'textarea[placeholder*="description" i], ' +
      'label:has-text("Description") + textarea, ' +
      'label:has-text("Description") ~ textarea'
    ).first();
    
    // "Next" button in the modal
    this.nextButton = page.locator(
      'button:has-text("Next"), ' +
      'button[type="button"]:has-text("Next"), ' +
      '[aria-label*="Next" i], ' +
      'button[id*="next" i]'
    ).first();
    
    // "Create" button (final step)
    this.createSubmitButton = page.locator(
      'button:has-text("Create"), ' +
      'button[type="submit"]:has-text("Create"), ' +
      'button:has-text("Create Learning Instance"), ' +
      'button[id*="create" i]:not(:has-text("Create Learning Instance"))'
    ).first();
    
    this.cancelButton = page.locator('button:has-text("Cancel"), button[id*="cancel" i], button:has-text("Close")').first();
    this.successMessage = page.locator('.success, .alert-success, [role="alert"]:has-text("success" i), [class*="success" i]').first();
    this.instanceList = page.locator('[class*="list" i], [class*="table" i], tbody, [role="list"], [class*="instances" i]').first();
    this.createdInstance = page.locator('[class*="instance" i], [data-instance-id], [data-instance-name]').first();
  }

  /**
   * Click "Create Learning Instance" button (top right)
   */
  async clickCreateInstance() {
    logger.info('Attempting to click "Create Learning Instance" button');
    
    // Wait for page to be fully loaded - wait for the Learning Instances heading first
    try {
      await this.page.waitForSelector('h1:has-text("Learning Instances"), h1:has-text("Learning"), h2:has-text("Learning Instances")', { state: 'visible', timeout: 15000 });
      logger.info('Learning Instances page heading is visible');
    } catch (e) {
      logger.warn(`Learning Instances heading not found: ${e.message}`);
    }
    
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
      logger.warn('Network idle timeout, proceeding anyway');
    });
    await this.page.waitForTimeout(3000); // Wait for dynamic content to render
    
    // Try multiple selectors for the Create Learning Instance button
    // Based on the UI, it's a blue button in the top right of main content area
    const createButtonSelectors = [
      // Most specific: exact text match with various patterns
      this.page.locator('button:has-text("Create Learning Instance")').first(),
      this.page.locator('button').filter({ hasText: /create learning instance/i }).first(),
      // Try with partial text matches
      this.page.locator('button:has-text("Create")').filter({ hasText: /learning/i }).first(),
      // Try in main content area (top right)
      this.page.locator('main button:has-text("Create Learning Instance")').first(),
      this.page.locator('[role="main"] button:has-text("Create Learning Instance")').first(),
      this.page.locator('header button:has-text("Create Learning Instance")').first(),
      // Try with aria-label
      this.page.locator('[aria-label*="Create Learning Instance" i]').first(),
      this.page.locator('button[aria-label*="Create Learning Instance" i]').first(),
      this.page.locator('[aria-label*="Create" i]').filter({ hasText: /learning/i }).first(),
      // Try by class/id patterns
      this.page.locator('button[id*="create" i][id*="learning" i]').first(),
      this.page.locator('button[class*="create" i][class*="learning" i]').first(),
      this.createButton // Fallback to the original selector
    ];
    
    let clicked = false;
    for (let i = 0; i < createButtonSelectors.length; i++) {
      const selector = createButtonSelectors[i];
      try {
        const count = await selector.count();
        logger.debug(`Selector ${i + 1} found ${count} elements`);
        if (count > 0) {
          const isVisible = await selector.isVisible({ timeout: 5000 }).catch(() => false);
          if (isVisible) {
            const text = await selector.textContent().catch(() => '');
            const ariaLabel = await selector.getAttribute('aria-label').catch(() => '');
            logger.info(`Trying Create button selector ${i + 1}/${createButtonSelectors.length} (text: "${text?.trim()}", aria-label: "${ariaLabel}")`);
            
            // Verify it's the right button - must contain "Create" and "Learning" or "Instance"
            const buttonText = (text || ariaLabel || '').toLowerCase();
            if (buttonText.includes('create') && (buttonText.includes('learning') || buttonText.includes('instance'))) {
              await selector.scrollIntoViewIfNeeded();
              await this.page.waitForTimeout(500);
              await selector.click({ timeout: 15000, force: false });
              clicked = true;
              logger.info('Create Learning Instance button clicked successfully');
              break;
            } else {
              logger.debug(`Skipping button - doesn't match required text pattern`);
            }
          } else {
            logger.debug(`Selector ${i + 1} found element but it's not visible`);
          }
        }
      } catch (e) {
        logger.debug(`Create button selector ${i + 1} failed: ${e.message}`);
        // Continue to next selector
      }
    }
    
    if (!clicked) {
      logger.warn('Standard selectors failed, trying fallback: searching all visible buttons');
      // Fallback: find all visible buttons and look for one with "Create Learning Instance"
      const allButtons = this.page.locator('button:visible');
      const buttonCount = await allButtons.count();
      logger.info(`Found ${buttonCount} visible buttons on the page`);
      
      for (let i = 0; i < Math.min(buttonCount, 50); i++) { // Limit to first 50 buttons
        const button = allButtons.nth(i);
        try {
          const text = await button.textContent({ timeout: 2000 }).catch(() => '');
          const ariaLabel = await button.getAttribute('aria-label').catch(() => '');
          const isVisible = await button.isVisible({ timeout: 1000 }).catch(() => false);
          
          if (isVisible) {
            const buttonText = (text || ariaLabel || '').toLowerCase().trim();
            logger.debug(`Button ${i}: "${buttonText}" (visible: ${isVisible})`);
            
            // Check if it matches "Create Learning Instance" - more flexible matching
            if (buttonText.includes('create') && 
                (buttonText.includes('learning') || buttonText.includes('instance'))) {
              logger.info(`Found Create Learning Instance button at index ${i} with text "${buttonText}", clicking...`);
              await button.scrollIntoViewIfNeeded();
              await this.page.waitForTimeout(500);
              await button.click({ timeout: 15000, force: false });
              clicked = true;
              logger.info('Create Learning Instance button clicked by fallback method');
              break;
            }
          }
        } catch (e) {
          // Continue to next button
          logger.debug(`Error checking button ${i}: ${e.message}`);
        }
      }
    }
    
    if (!clicked) {
      logger.error('Could not find Create Learning Instance button');
      // Take a screenshot for debugging
      await this.page.screenshot({ path: 'test-results/create-button-not-found.png', fullPage: true });
      
      // Log all buttons for debugging
      const allButtons = this.page.locator('button');
      const buttonCount = await allButtons.count();
      logger.error(`Total buttons on page: ${buttonCount}`);
      for (let i = 0; i < Math.min(buttonCount, 20); i++) {
        try {
          const button = allButtons.nth(i);
          const text = await button.textContent().catch(() => 'N/A');
          const ariaLabel = await button.getAttribute('aria-label').catch(() => 'N/A');
          const isVisible = await button.isVisible().catch(() => false);
          logger.error(`  Button ${i}: text="${text?.trim()}", aria-label="${ariaLabel}", visible=${isVisible}`);
        } catch (e) {
          // Skip
        }
      }
      
      throw new Error('Create Learning Instance button not found after trying all selectors');
    }
    
    // Wait for modal to appear
    try {
      await this.page.waitForSelector('h2:has-text("Create Learning Instance"), [role="dialog"]:has-text("Create Learning Instance"), h1:has-text("Create Learning Instance"), h3:has-text("Create Learning Instance"), [role="dialog"]', { state: 'visible', timeout: 15000 });
      logger.info('Create Learning Instance modal is visible');
    } catch (error) {
      logger.warn(`Create Learning Instance modal not found after click: ${error.message}`);
      // Take screenshot to see what happened
      await this.page.screenshot({ path: 'test-results/modal-not-found.png', fullPage: true });
    }
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000); // Additional wait for modal content to render
  }

  /**
   * Fill Learning Instance creation form (just name)
   * @param {string} name - Instance name (e.g., 'instance1')
   */
  async fillInstanceForm(name) {
    logger.info(`Filling Learning Instance form with name: ${name}`);
    
    // Wait for modal to be visible
    await this.page.waitForTimeout(1000);
    
    // Wait for name input to be visible
    await this.waitForElement(this.instanceNameInput, 10000);
    
    // Clear and fill name field
    await this.instanceNameInput.clear();
    await this.fillInput(this.instanceNameInput, name);
    logger.info(`Entered name: ${name}`);
  }

  /**
   * Click "Next" button in the modal
   */
  async clickNext() {
    logger.info('Clicking Next button');
    await this.waitForElement(this.nextButton, 10000);
    await this.nextButton.scrollIntoViewIfNeeded();
    await this.clickElement(this.nextButton);
    await this.page.waitForTimeout(1000); // Wait for next step to load
    logger.info('Next button clicked, proceeding to next step');
  }

  /**
   * Click "Create" button (final step)
   */
  async clickCreate() {
    logger.info('Clicking Create button (final step)');
    await this.waitForElement(this.createSubmitButton, 10000);
    await this.createSubmitButton.scrollIntoViewIfNeeded();
    await this.clickElement(this.createSubmitButton);
    await this.page.waitForTimeout(2000); // Wait for creation to complete
    logger.info('Create button clicked, instance should be created');
  }

  /**
   * Verify instance was created successfully
   */
  async verifyInstanceCreated(instanceName) {
    // Check for success message
    if (await this.isElementVisible(this.successMessage)) {
      return true;
    }

    // Check if instance appears in the list
    const instanceInList = this.page.locator(`text=${instanceName}, [aria-label*="${instanceName}"]`).first();
    return await this.isElementVisible(instanceInList);
  }

  /**
   * Get created instance details
   */
  async getInstanceDetails(instanceName) {
    const instanceElement = this.page.locator(`text=${instanceName}`).first();
    if (await this.isElementVisible(instanceElement)) {
      // Try to extract details from the element
      const text = await this.getText(instanceElement);
      return {
        name: instanceName,
        status: 'active', // Default, update based on actual structure
        id: '' // Extract from data attributes if available
      };
    }
    return null;
  }
}

module.exports = { LearningInstancePage };

