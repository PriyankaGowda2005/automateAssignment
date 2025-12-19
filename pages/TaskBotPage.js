const { BasePage } = require('./BasePage');
const logger = require('../utils/logger');

/**
 * Task Bot Page Object Model
 * Handles Task Bot creation and Message Box configuration
 */
class TaskBotPage extends BasePage {
  constructor(page) {
    super(page);
    // Task Bot creation modal form - comprehensive selectors
    this.taskNameInput = page.locator('input[name*="name" i], input[id*="name" i], input[placeholder*="name" i], input[placeholder*="Name" i], input[placeholder*="Untitled" i], input[aria-label*="name" i]').first();
    this.taskDescriptionInput = page.locator('textarea[name*="description" i], textarea[id*="description" i], textarea[placeholder*="description" i], textarea[aria-label*="description" i]').first();
    // "Create & edit" button in the modal
    this.createAndEditButton = page.locator('button:has-text("Create & edit"), button:has-text("Create & Edit"), button:has-text("Create and edit"), button[type="submit"]:has-text("Create")').first();
    this.createButton = page.locator('button:has-text("Create"), button[type="submit"]:has-text("Create"), button[id*="create" i], button[class*="create" i]').first();
    this.cancelButton = page.locator('button:has-text("Cancel"), button[id*="cancel" i]').first();
    this.successMessage = page.locator('.success, .alert-success, [role="alert"]:has-text("success" i), [class*="success" i], [id*="success" i]').first();
    this.errorMessage = page.locator('.error, .alert-error, [role="alert"]:has-text("error" i), [class*="error" i]').first();

    // Actions panel (left side) - comprehensive selectors
    this.actionsPanel = page.locator('[class*="actions" i], [class*="Actions" i], [id*="actions" i], aside, [role="complementary"], [class*="sidebar" i]').first();
    // Search input in Actions panel
    this.searchActionsInput = page.locator(
      'input[placeholder*="search" i], ' +
      'input[placeholder*="Search" i], ' +
      'input[type="search"], ' +
      'input[name*="search" i], ' +
      'input[id*="search" i], ' +
      '[class*="actions" i] input[type="text"], ' +
      '[class*="Actions" i] input[type="text"]'
    ).first();
    // Message Box action in Actions list
    this.messageBoxAction = page.locator(
      'text=Message box, ' +
      'text=Message Box, ' +
      'text=MessageBox, ' +
      '[title*="Message Box" i], ' +
      '[title*="Message box" i], ' +
      '[aria-label*="Message Box" i], ' +
      '[aria-label*="Message box" i], ' +
      '[aria-label*="MessageBox" i], ' +
      '[data-action*="message" i], ' +
      'li:has-text("Message box"), ' +
      'li:has-text("Message Box"), ' +
      'div:has-text("Message box"), ' +
      'div:has-text("Message Box")'
    ).first();

    // Message Box configuration panel (right side) - comprehensive selectors
    this.messageBoxPanel = page.locator(
      '[class*="panel" i], ' +
      '[class*="Panel" i], ' +
      '[class*="properties" i], ' +
      '[class*="Properties" i], ' +
      '[class*="config" i], ' +
      '[id*="panel" i], ' +
      '[class*="Action details" i], ' +
      'text=Message box, ' +
      'text=Message Box'
    ).first();
    
    // "Enter the message to display" field
    this.messageInput = page.locator(
      'input[placeholder*="Enter the message to display" i], ' +
      'textarea[placeholder*="Enter the message to display" i], ' +
      'input[name*="message" i], ' +
      'textarea[name*="message" i], ' +
      'input[id*="message" i], ' +
      'textarea[id*="message" i], ' +
      'label:has-text("Enter the message to display") + input, ' +
      'label:has-text("Enter the message to display") + textarea'
    ).first();
    
    // "Enter the message box window title" field (optional)
    this.titleInput = page.locator(
      'input[placeholder*="Enter the message box window title" i], ' +
      'input[name*="title" i], ' +
      'input[id*="title" i], ' +
      'label:has-text("Enter the message box window title") + input'
    ).first();
    
    // "Close message box after" checkbox
    this.closeAfterCheckbox = page.locator(
      'input[type="checkbox"]:near(label:has-text("Close message box after")), ' +
      'label:has-text("Close message box after") input[type="checkbox"], ' +
      'input[type="checkbox"][name*="close" i], ' +
      'input[type="checkbox"][id*="close" i]'
    ).first();
    
    // "Seconds" input field (appears when checkbox is checked)
    this.secondsInput = page.locator(
      'input[placeholder*="Seconds" i], ' +
      'input[name*="second" i], ' +
      'input[id*="second" i], ' +
      'label:has-text("Seconds") + input, ' +
      'input[type="number"]:near(label:has-text("Seconds"))'
    ).first();
    
    // Save button in top right header (not in the panel)
    this.saveButton = page.locator(
      'header button:has-text("Save"), ' +
      '[class*="header" i] button:has-text("Save"), ' +
      'button:has-text("Save"), ' +
      'button[type="submit"]:has-text("Save"), ' +
      'button[id*="save" i], ' +
      'button[class*="save" i]'
    ).first();
    
    this.closeButton = page.locator('button:has-text("Close"), button[aria-label*="close" i], button[id*="close" i]').first();
  }

  /**
   * Fill Task Bot creation form in modal
   */
  async fillTaskBotForm(name, description) {
    // Wait for modal/form to appear - try multiple strategies
    logger.info('Waiting for Task Bot creation form to appear...');
    await this.page.waitForTimeout(2000);
    
    // Try to find the name input with multiple selectors
    let nameInputFound = false;
    const nameInputSelectors = [
      this.taskNameInput,
      this.page.locator('input[name*="name" i]').first(),
      this.page.locator('input[placeholder*="name" i]').first(),
      this.page.locator('input[placeholder*="Name" i]').first(),
      this.page.locator('input[placeholder*="Untitled" i]').first(),
      this.page.locator('input[id*="name" i]').first(),
      this.page.locator('input[type="text"]').first(),
      this.page.locator('input').first(),
    ];
    
    let nameInput = null;
    for (let i = 0; i < nameInputSelectors.length; i++) {
      const selector = nameInputSelectors[i];
      try {
        const isVisible = await selector.isVisible({ timeout: 5000 }).catch(() => false);
        if (isVisible) {
          nameInput = selector;
          nameInputFound = true;
          logger.info(`Found Task Bot name input using selector ${i + 1}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!nameInputFound || !nameInput) {
      // Take screenshot for debugging
      await this.page.screenshot({ path: 'test-results/taskbot-form-not-found.png', fullPage: true }).catch(() => {});
      throw new Error('Task Bot name input field not found. Form may not have loaded.');
    }
    
    // Update the taskNameInput reference for future use
    this.taskNameInput = nameInput;
    
    // Clear and fill name field
    await nameInput.clear();
    await this.fillInput(nameInput, name);
    logger.info(`Filled Task Bot name: ${name}`);
    
    if (description) {
      // Try to find description field
      const descInputSelectors = [
        this.taskDescriptionInput,
        this.page.locator('textarea[name*="description" i]').first(),
        this.page.locator('textarea[id*="description" i]').first(),
        this.page.locator('textarea[placeholder*="description" i]').first(),
        this.page.locator('textarea').first(),
      ];
      
      let descInput = null;
      for (const selector of descInputSelectors) {
        try {
          if (await this.isElementVisible(selector, 3000)) {
            descInput = selector;
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (descInput) {
        await this.fillInput(descInput, description);
        logger.info(`Filled Task Bot description: ${description}`);
      } else {
        logger.warn('Description field not found, skipping description');
      }
    }
  }

  /**
   * Click "Create & edit" button to create Task Bot and open editor
   */
  async createTaskBot() {
    // Try "Create & edit" button first, then fallback to "Create"
    const createButtons = [
      this.createAndEditButton,
      this.page.locator('button:has-text("Create & edit")').first(),
      this.page.locator('button:has-text("Create & Edit")').first(),
      this.createButton
    ];
    
    let clicked = false;
    for (const button of createButtons) {
      try {
        if (await this.isElementVisible(button, 3000)) {
          await button.scrollIntoViewIfNeeded();
          await this.clickElement(button);
          clicked = true;
          logger.info('Clicked Create & edit button');
          break;
        }
      } catch (e) {
        // Continue to next button
      }
    }
    
    if (!clicked) {
      await this.waitForElement(this.createButton, 10000);
      await this.clickElement(this.createButton);
    }
    
    // Wait for the editor to load (Actions panel should be visible)
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000); // Wait for editor to fully render
    logger.info('Task Bot editor should now be open');
  }

  /**
   * Search for Message Box action in Actions panel (left side)
   */
  async searchMessageBox() {
    // Wait for Actions panel to be visible
    await this.waitForElement(this.actionsPanel, 10000);
    
    // Find and use the search input in Actions panel
    const searchSelectors = [
      this.searchActionsInput,
      this.page.locator('[class*="actions" i] input[type="text"]').first(),
      this.page.locator('[class*="Actions" i] input[type="text"]').first(),
      this.page.locator('input[placeholder*="search" i]').first()
    ];
    
    let searched = false;
    for (const selector of searchSelectors) {
      try {
        if (await this.isElementVisible(selector, 3000)) {
          await selector.clear();
          await this.fillInput(selector, 'message box');
          searched = true;
          logger.info('Searched for "message box" in Actions panel');
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!searched) {
      logger.warn('Could not find search input in Actions panel');
    }
    
    // Wait for search results to appear
    await this.page.waitForTimeout(1500);
  }

  /**
   * Add Message Box action by double-clicking in Actions panel
   */
  async addMessageBoxAction() {
    await this.searchMessageBox();
    
    // Wait for search results to appear
    await this.page.waitForTimeout(1500);
    
    logger.info('Looking for Message Box action item (not the heading)...');
    
    // The issue: There's a collapsible section header "Message box" and an action item "Message box" underneath
    // We need to click the action item, not the section header
    // Strategy: Find all elements with "Message box" text and click the one that's NOT the collapsible header
    
    let doubleClicked = false;
    
    // First, try to find the action item specifically (it's usually in a list or has specific structure)
    const actionItemSelectors = [
      // Look for items that are clickable/interactive (not headers)
      '[role="menuitem"]:has-text("Message box")',
      '[role="menuitem"]:has-text("Message Box")',
      'li[role="menuitem"]:has-text("Message box")',
      'li[role="menuitem"]:has-text("Message Box")',
      // Look for items with icons (actions usually have icons)
      '[class*="action" i]:has-text("Message box")',
      '[class*="item" i]:has-text("Message box"):not([class*="header" i]):not([class*="title" i])',
      // Look for items that are children of the expanded section (not the section itself)
      '[class*="expanded" i] [class*="item" i]:has-text("Message box")',
      '[aria-expanded="true"] ~ * [class*="item" i]:has-text("Message box")',
      // Look for clickable elements with Message box text
      'button:has-text("Message box")',
      'a:has-text("Message box")',
      'div[role="button"]:has-text("Message box")',
    ];
    
    for (let i = 0; i < actionItemSelectors.length; i++) {
      const selector = this.page.locator(actionItemSelectors[i]).first();
      try {
        const count = await selector.count();
        if (count > 0) {
          const isVisible = await selector.isVisible({ timeout: 3000 }).catch(() => false);
          if (isVisible) {
            // Check if it's not a header/collapsible by checking if it has click handlers or is interactive
            const tagName = await selector.evaluate(el => el.tagName).catch(() => '');
            const role = await selector.getAttribute('role').catch(() => '');
            const className = await selector.getAttribute('class').catch(() => '');
            
            // Skip if it looks like a header/collapsible section
            if (className && (className.includes('header') || className.includes('title') || className.includes('section'))) {
              logger.debug(`Skipping selector ${i + 1} - looks like a header`);
              continue;
            }
            
            logger.info(`Trying Message Box action selector ${i + 1} (tag: ${tagName}, role: ${role})`);
            await selector.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(300);
            await this.doubleClickElement(selector);
            doubleClicked = true;
            logger.info('Double-clicked Message Box action item');
            break;
          }
        }
      } catch (e) {
        logger.debug(`Failed with selector ${i + 1}: ${e.message}`);
      }
    }
    
    // If that didn't work, try finding all "Message box" elements and clicking the one that's NOT the header
    if (!doubleClicked) {
      logger.info('Trying alternative: Find all Message box elements and click the action item (not header)');
      try {
        const allMessageBoxElements = this.page.locator('text=Message box, text=Message Box');
        const count = await allMessageBoxElements.count();
        logger.info(`Found ${count} elements with "Message box" text`);
        
        // Find the one that's NOT the collapsible header
        // The header is usually the first one or has a caret/arrow icon
        for (let i = 0; i < count; i++) {
          const element = allMessageBoxElements.nth(i);
          try {
            const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
            if (!isVisible) continue;
            
            // Get detailed info about the element and its parents
            const elementInfo = await element.evaluate(el => {
              const parent = el.parentElement;
              const grandParent = parent?.parentElement;
              return {
                tagName: el.tagName,
                className: el.className || '',
                role: el.getAttribute('role') || '',
                hasCaret: !!el.querySelector('[class*="caret" i], [class*="arrow" i], [class*="chevron" i]'),
                parentTag: parent?.tagName || '',
                parentClass: parent?.className || '',
                parentRole: parent?.getAttribute('role') || '',
                grandParentClass: grandParent?.className || '',
                isClickable: el.onclick !== null || el.getAttribute('onclick') !== null,
                hasIcon: !!el.querySelector('svg, img, [class*="icon" i]'),
              };
            }).catch(() => ({}));
            
            logger.info(`Element ${i}: tag="${elementInfo.tagName}", class="${elementInfo.className}", ` +
              `parent="${elementInfo.parentTag}" class="${elementInfo.parentClass}", ` +
              `hasCaret=${elementInfo.hasCaret}, hasIcon=${elementInfo.hasIcon}`);
            
            // Skip if it's clearly a header:
            // - Has a caret/arrow (collapsible indicator)
            // - Parent is a header/title/section
            // - No icon (action items usually have icons)
            const isHeader = elementInfo.hasCaret || 
                           elementInfo.parentClass.includes('header') || 
                           elementInfo.parentClass.includes('title') || 
                           elementInfo.parentClass.includes('section') ||
                           elementInfo.parentRole === 'heading' ||
                           (elementInfo.grandParentClass && elementInfo.grandParentClass.includes('header'));
            
            if (isHeader) {
              logger.debug(`Skipping element ${i} - identified as header/collapsible section`);
              continue;
            }
            
            // This looks like the action item - try to double-click it
            logger.info(`Element ${i} looks like the action item, attempting to double-click...`);
            await element.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(300);
            
            try {
              await element.dblclick({ timeout: 10000 });
              doubleClicked = true;
              logger.info(`✓ Double-clicked Message Box action at index ${i}`);
              break;
            } catch (clickError) {
              logger.debug(`Double-click failed for element ${i}: ${clickError.message}`);
              // Try single click then double click
              try {
                await element.click({ timeout: 5000 });
                await this.page.waitForTimeout(200);
                await element.dblclick({ timeout: 10000 });
                doubleClicked = true;
                logger.info(`✓ Double-clicked Message Box action at index ${i} (with single click first)`);
                break;
              } catch (e2) {
                logger.debug(`Alternative click method also failed for element ${i}`);
                // Continue to next element
              }
            }
          } catch (e) {
            logger.debug(`Error checking element ${i}: ${e.message}`);
          }
        }
      } catch (e) {
        logger.debug(`Could not find Message Box elements: ${e.message}`);
      }
    }
    
    // Final fallback: use the original selector but try to be more specific
    if (!doubleClicked) {
      logger.warn('Trying fallback: Using original selector');
      try {
        // Try to find the action in a list structure (not the header)
        const actionInList = this.page.locator('li:has-text("Message box"):not(:has([class*="header" i]))').first();
        if (await this.isElementVisible(actionInList, 5000)) {
          await this.doubleClickElement(actionInList);
          doubleClicked = true;
          logger.info('Double-clicked Message Box action using list item selector');
        } else {
          await this.waitForElement(this.messageBoxAction, 10000);
          await this.doubleClickElement(this.messageBoxAction);
          doubleClicked = true;
        }
      } catch (e) {
        logger.error(`Failed to double-click Message Box action: ${e.message}`);
        throw new Error(`Could not add Message Box action: ${e.message}`);
      }
    }
    
    // Wait for Message Box configuration panel to appear on the right
    logger.info('Waiting for Message Box configuration panel to appear...');
    await this.page.waitForTimeout(2000);
    
    // Try to wait for the message input field to appear (most reliable indicator)
    let panelAppeared = false;
    const panelIndicators = [
      this.messageInput,
      this.page.locator('input[placeholder*="Enter the message to display" i]').first(),
      this.page.locator('textarea[placeholder*="Enter the message to display" i]').first(),
      this.page.locator('text=Message box').first(),
      this.closeAfterCheckbox,
    ];
    
    for (let i = 0; i < panelIndicators.length; i++) {
      try {
        const isVisible = await this.isElementVisible(panelIndicators[i], 10000);
        if (isVisible) {
          panelAppeared = true;
          logger.info(`✓ Message Box configuration panel appeared (indicator ${i + 1})`);
          break;
        }
      } catch (e) {
        logger.debug(`Panel indicator ${i + 1} not found: ${e.message}`);
      }
    }
    
    if (!panelAppeared) {
      logger.warn('Message Box configuration panel did not appear immediately, waiting longer...');
      await this.page.waitForTimeout(3000);
      
      // Try one more time
      for (const indicator of panelIndicators) {
        try {
          if (await this.isElementVisible(indicator, 5000)) {
            panelAppeared = true;
            logger.info('✓ Message Box configuration panel appeared after longer wait');
            break;
          }
        } catch (e) {
          // Continue
        }
      }
    }
    
    // Verify the action was added by checking if the configuration panel appears
    const panelVisible = await this.verifyMessageBoxPanelVisible();
    if (panelVisible || panelAppeared) {
      logger.info('Message Box action added successfully - configuration panel is visible');
    } else {
      logger.warn('Message Box configuration panel not visible - action may not have been added');
      await this.page.screenshot({ path: 'test-results/messagebox-panel-missing.png', fullPage: true }).catch(() => {});
    }
  }

  /**
   * Verify Message Box configuration panel is visible
   */
  async verifyMessageBoxPanelVisible() {
    logger.info('Verifying Message Box configuration panel is visible...');
    
    // Wait a bit for the panel to appear after action is added
    await this.page.waitForTimeout(2000);
    
    // Check multiple indicators that the Message Box panel is visible
    const indicators = [
      // Check the panel selector
      this.messageBoxPanel,
      // Check for the message input field (most reliable indicator)
      this.messageInput,
      this.page.locator('input[placeholder*="Enter the message to display" i]').first(),
      this.page.locator('textarea[placeholder*="Enter the message to display" i]').first(),
      // Check for panel title/heading
      this.page.locator('text=Message box, text=Message Box').first(),
      this.page.locator('h1:has-text("Message box"), h2:has-text("Message box"), h3:has-text("Message box")').first(),
      // Check for the checkbox
      this.closeAfterCheckbox,
      this.page.locator('label:has-text("Close message box after")').first(),
      // Check for any panel/configuration container
      this.page.locator('[class*="panel" i]:has-text("Message box")').first(),
      this.page.locator('[class*="properties" i]:has-text("Message box")').first(),
      this.page.locator('[class*="config" i]:has-text("Message box")').first(),
      // Check for description text
      this.page.locator('text=Inserts a message box').first(),
      this.page.locator('text=message box to show a message').first(),
    ];
    
    let found = false;
    let foundIndicator = '';
    
    for (let i = 0; i < indicators.length; i++) {
      try {
        const isVisible = await this.isElementVisible(indicators[i], 3000);
        if (isVisible) {
          found = true;
          const text = await indicators[i].textContent().catch(() => '');
          foundIndicator = `Indicator ${i + 1} (text: "${text.substring(0, 50)}...")`;
          logger.info(`✓ Message Box panel is visible - ${foundIndicator}`);
          break;
        }
      } catch (e) {
        // Continue checking other indicators
      }
    }
    
    if (!found) {
      logger.warn('Message Box panel not found with standard indicators');
      // Take a screenshot for debugging
      await this.page.screenshot({ path: 'test-results/messagebox-panel-not-found.png', fullPage: true }).catch(() => {});
      
      // Try one more time with a longer wait
      await this.page.waitForTimeout(2000);
      const finalCheck = await this.isElementVisible(this.messageInput, 5000);
      if (finalCheck) {
        logger.info('✓ Message Box panel found on second attempt');
        return true;
      }
    }
    
    return found;
  }

  /**
   * Fill Message Box configuration in the right panel
   * @param {Object} config - Configuration object with message, title, closeAfter, seconds
   */
  async configureMessageBox(config) {
    logger.info('=== Starting Message Box configuration ===');
    
    // Wait for Message Box configuration panel to be visible
    await this.page.waitForTimeout(1000); // Give panel time to render
    const panelVisible = await this.isElementVisible(this.messageBoxPanel, 10000);
    if (!panelVisible) {
      logger.warn('Message Box panel not visible, trying to find it with alternative selectors');
      // Try alternative panel selectors
      const altPanel = this.page.locator('text=Message box, [class*="panel" i], [class*="properties" i]').first();
      await this.waitForElement(altPanel, 10000);
    }
    logger.info('Message Box configuration panel is visible');
    
    // Fill message field - "Enter the message to display"
    if (config.message) {
      logger.info(`Attempting to fill message: "${config.message}"`);
      const messageSelectors = [
        this.messageInput,
        this.page.locator('input[placeholder*="Enter the message to display" i]').first(),
        this.page.locator('textarea[placeholder*="Enter the message to display" i]').first(),
        this.page.locator('input[placeholder*="message to display" i]').first(),
        this.page.locator('textarea[placeholder*="message to display" i]').first(),
        this.page.locator('label:has-text("Enter the message to display") + input').first(),
        this.page.locator('label:has-text("Enter the message to display") + textarea').first(),
        this.page.locator('label:has-text("message to display") + input').first(),
        this.page.locator('label:has-text("message to display") + textarea').first(),
        // Try finding by label text and then input
        this.page.locator('input').filter({ hasText: /message/i }).first(),
        this.page.locator('textarea').filter({ hasText: /message/i }).first(),
      ];
      
      let filled = false;
      for (let i = 0; i < messageSelectors.length; i++) {
        const selector = messageSelectors[i];
        try {
          const isVisible = await this.isElementVisible(selector, 3000);
          if (isVisible) {
            await selector.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(200);
            await selector.clear();
            await this.fillInput(selector, config.message);
            filled = true;
            logger.info(`✓ Filled message: "${config.message}" using selector ${i + 1}`);
            
            // Verify the value was set
            const value = await selector.inputValue().catch(() => '');
            if (value.includes(config.message)) {
              logger.info(`✓ Verified message was set correctly`);
            }
            break;
          }
        } catch (e) {
          logger.debug(`Message selector ${i + 1} failed: ${e.message}`);
        }
      }
      if (!filled) {
        await this.page.screenshot({ path: 'test-results/message-input-not-found.png', fullPage: true }).catch(() => {});
        logger.error('Could not find message input field after trying all selectors');
        throw new Error('Message input field not found');
      }
    }

    // Fill title field (optional) - "Enter the message box window title"
    if (config.title) {
      logger.info(`Attempting to fill title: "${config.title}"`);
      const titleSelectors = [
        this.titleInput,
        this.page.locator('input[placeholder*="Enter the message box window title" i]').first(),
        this.page.locator('input[placeholder*="message box window title" i]').first(),
        this.page.locator('label:has-text("Enter the message box window title") + input').first(),
        this.page.locator('label:has-text("window title") + input').first(),
      ];
      
      let titleFilled = false;
      for (const selector of titleSelectors) {
        try {
          if (await this.isElementVisible(selector, 3000)) {
            await selector.clear();
            await this.fillInput(selector, config.title);
            titleFilled = true;
            logger.info(`✓ Filled title: "${config.title}"`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      if (!titleFilled) {
        logger.debug('Title input not found or not visible, skipping (optional field)');
      }
    }

    // Check "Close message box after" checkbox
    if (config.closeAfter !== undefined) {
      logger.info(`Attempting to ${config.closeAfter ? 'check' : 'uncheck'} "Close message box after" checkbox`);
      const checkboxSelectors = [
        this.closeAfterCheckbox,
        this.page.locator('input[type="checkbox"]:near(label:has-text("Close message box after"))').first(),
        this.page.locator('label:has-text("Close message box after") input[type="checkbox"]').first(),
        this.page.locator('label:has-text("Close message box after")').locator('..').locator('input[type="checkbox"]').first(),
        this.page.locator('input[type="checkbox"]').filter({ has: this.page.locator('text=Close message box after').locator('..') }).first(),
        // Try finding checkbox near the text
        this.page.locator('text=Close message box after').locator('..').locator('input[type="checkbox"]').first(),
        this.page.locator('text=Close message box after').locator('xpath=following::input[@type="checkbox"]').first(),
      ];
      
      let checked = false;
      for (let i = 0; i < checkboxSelectors.length; i++) {
        const selector = checkboxSelectors[i];
        try {
          const isVisible = await this.isElementVisible(selector, 3000);
          if (isVisible) {
            await selector.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(200);
            const isChecked = await selector.isChecked();
            logger.info(`Checkbox current state: ${isChecked}, target state: ${config.closeAfter}`);
            
            if (config.closeAfter && !isChecked) {
              // Try clicking the label first (more reliable)
              try {
                const label = this.page.locator('label:has-text("Close message box after")').first();
                if (await this.isElementVisible(label, 2000)) {
                  await label.click();
                  logger.info('✓ Clicked label to check checkbox');
                } else {
                  await this.clickElement(selector);
                  logger.info('✓ Clicked checkbox directly');
                }
              } catch (labelError) {
                await this.clickElement(selector);
                logger.info('✓ Clicked checkbox directly (label click failed)');
              }
            } else if (!config.closeAfter && isChecked) {
              await this.clickElement(selector);
              logger.info('✓ Unchecked checkbox');
            } else {
              logger.info('Checkbox already in desired state');
            }
            
            // Verify checkbox state
            await this.page.waitForTimeout(300);
            const newState = await selector.isChecked();
            if (newState === config.closeAfter) {
              logger.info(`✓ Checkbox state verified: ${newState}`);
            }
            
            checked = true;
            break;
          }
        } catch (e) {
          logger.debug(`Checkbox selector ${i + 1} failed: ${e.message}`);
        }
      }
      
      if (!checked) {
        await this.page.screenshot({ path: 'test-results/checkbox-not-found.png', fullPage: true }).catch(() => {});
        logger.error('Could not find "Close message box after" checkbox');
        throw new Error('Close message box after checkbox not found');
      }
      
      // Fill seconds field if checkbox is checked
      if (config.closeAfter && config.seconds) {
        logger.info(`Checkbox is checked, waiting for seconds input to appear...`);
        // Wait for the seconds input to become visible (it appears after checkbox is checked)
        await this.page.waitForTimeout(1000);
        
        // Fill seconds field
        const secondsSelectors = [
          this.secondsInput,
          this.page.locator('input[placeholder*="Seconds" i]').first(),
          this.page.locator('label:has-text("Seconds") + input').first(),
          this.page.locator('label:has-text("Seconds")').locator('..').locator('input').first(),
          this.page.locator('input[type="number"]:near(label:has-text("Seconds"))').first(),
          this.page.locator('input').filter({ has: this.page.locator('text=Seconds') }).first(),
        ];
        
        let secondsFilled = false;
        for (let i = 0; i < secondsSelectors.length; i++) {
          const selector = secondsSelectors[i];
          try {
            // Wait a bit longer for the field to appear after checkbox is checked
            const isVisible = await this.isElementVisible(selector, 5000);
            if (isVisible) {
              await selector.scrollIntoViewIfNeeded();
              await this.page.waitForTimeout(200);
              await selector.clear();
              await this.fillInput(selector, config.seconds);
              secondsFilled = true;
              logger.info(`✓ Filled seconds: ${config.seconds} using selector ${i + 1}`);
              
              // Verify the value
              const value = await selector.inputValue().catch(() => '');
              if (value === config.seconds || value.includes(config.seconds)) {
                logger.info(`✓ Verified seconds value was set correctly`);
              }
              break;
            }
          } catch (e) {
            logger.debug(`Seconds selector ${i + 1} failed: ${e.message}`);
          }
        }
        if (!secondsFilled) {
          logger.warn('Could not find seconds input field - it may not be visible yet or selector needs adjustment');
          // Don't throw error, as this might be optional in some cases
        }
      }
    }
    
    logger.info('=== Message Box configuration completed ===');
  }

  /**
   * Verify all UI elements in Message Box panel
   */
  async verifyMessageBoxUIElements() {
    return {
      messageInputVisible: await this.isElementVisible(this.messageInput, 5000),
      titleInputVisible: await this.isElementVisible(this.titleInput, 3000),
      closeAfterCheckboxVisible: await this.isElementVisible(this.closeAfterCheckbox, 5000),
      secondsInputVisible: await this.isElementVisible(this.secondsInput, 3000),
      saveButtonVisible: await this.isElementVisible(this.saveButton, 5000)
    };
  }

  /**
   * Save configuration using Save button in top right header
   */
  async saveConfiguration() {
    logger.info('=== Attempting to save configuration ===');
    
    // Save button is in the top right header, not in the panel
    const saveSelectors = [
      this.page.locator('header button:has-text("Save")').first(),
      this.page.locator('[class*="header" i] button:has-text("Save")').first(),
      this.page.locator('button:has-text("Save"):visible').first(),
      this.saveButton,
      this.page.locator('button:has-text("Save")').first(),
      // Try more specific selectors for top right
      this.page.locator('[class*="toolbar" i] button:has-text("Save")').first(),
      this.page.locator('[class*="header" i] [class*="button" i]:has-text("Save")').first(),
      // Try by button type
      this.page.locator('button[type="button"]:has-text("Save")').first(),
      this.page.locator('button[type="submit"]:has-text("Save")').first(),
    ];
    
    let saved = false;
    for (let i = 0; i < saveSelectors.length; i++) {
      const selector = saveSelectors[i];
      try {
        const isVisible = await this.isElementVisible(selector, 5000);
        if (isVisible) {
          // Get button info for logging
          const buttonText = await selector.textContent().catch(() => '');
          const buttonId = await selector.getAttribute('id').catch(() => '');
          const buttonClass = await selector.getAttribute('class').catch(() => '');
          logger.info(`Found Save button: text="${buttonText}", id="${buttonId}", class="${buttonClass}"`);
          
          await selector.scrollIntoViewIfNeeded();
          await this.page.waitForTimeout(300);
          
          // Try multiple click strategies
          try {
            await selector.click({ timeout: 10000 });
            saved = true;
            logger.info(`✓ Clicked Save button using selector ${i + 1} (regular click)`);
            break;
          } catch (clickError) {
            logger.debug(`Regular click failed, trying force click: ${clickError.message}`);
            try {
              await selector.click({ timeout: 10000, force: true });
              saved = true;
              logger.info(`✓ Clicked Save button using selector ${i + 1} (force click)`);
              break;
            } catch (forceError) {
              logger.debug(`Force click also failed: ${forceError.message}`);
              // Try JavaScript click
              try {
                await selector.evaluate(el => el.click());
                saved = true;
                logger.info(`✓ Clicked Save button using selector ${i + 1} (JavaScript click)`);
                break;
              } catch (jsError) {
                logger.debug(`JavaScript click failed: ${jsError.message}`);
              }
            }
          }
        }
      } catch (e) {
        logger.debug(`Save selector ${i + 1} failed: ${e.message}`);
      }
    }
    
    if (!saved) {
      logger.warn('Could not find Save button with standard selectors, trying fallback');
      await this.page.screenshot({ path: 'test-results/save-button-not-found.png', fullPage: true }).catch(() => {});
      
      // Fallback: try to find any button with "Save" text
      try {
        const allSaveButtons = this.page.locator('button:has-text("Save")');
        const count = await allSaveButtons.count();
        logger.info(`Found ${count} button(s) with "Save" text`);
        
        for (let i = 0; i < count; i++) {
          const btn = allSaveButtons.nth(i);
          try {
            const isVisible = await btn.isVisible({ timeout: 2000 }).catch(() => false);
            if (isVisible) {
              await btn.scrollIntoViewIfNeeded();
              await this.page.waitForTimeout(300);
              await btn.click({ timeout: 10000 });
              saved = true;
              logger.info(`✓ Clicked Save button at index ${i}`);
              break;
            }
          } catch (e) {
            logger.debug(`Failed to click Save button at index ${i}: ${e.message}`);
          }
        }
      } catch (e) {
        logger.error(`Fallback Save button search failed: ${e.message}`);
      }
      
      if (!saved) {
        throw new Error('Could not find or click Save button');
      }
    }
    
    // Wait for save to complete
    logger.info('Waiting for save operation to complete...');
    await this.page.waitForTimeout(2000);
    
    // Check if there's a success message or if the page state changed
    try {
      const successIndicators = [
        this.page.locator('text=Saved, text=saved successfully, [class*="success" i]').first(),
        this.page.locator('[class*="notification" i]:has-text("saved")').first(),
      ];
      
      for (const indicator of successIndicators) {
        const visible = await indicator.isVisible({ timeout: 3000 }).catch(() => false);
        if (visible) {
          logger.info('✓ Save operation completed successfully');
          break;
        }
      }
    } catch (e) {
      // No success indicator found, but that's okay - save might have completed silently
      logger.debug('No success indicator found, but save action was clicked');
    }
    
    logger.info('=== Save configuration completed ===');
  }

  /**
   * Check if success message is displayed
   */
  async isSuccessMessageVisible() {
    return await this.isElementVisible(this.successMessage);
  }

  /**
   * Get success message text
   */
  async getSuccessMessage() {
    if (await this.isSuccessMessageVisible()) {
      return await this.getText(this.successMessage);
    }
    return '';
  }
}

module.exports = { TaskBotPage };


