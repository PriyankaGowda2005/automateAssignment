const { BasePage } = require('./BasePage');
const logger = require('../utils/logger');

/**
 * Automation Page Object Model
 * Handles navigation and interactions in the Automation section
 */
class AutomationPage extends BasePage {
  constructor(page) {
    super(page);
    // Comprehensive selectors for Automation section navigation
    this.automationMenu = page.locator('text=Automation, [aria-label*="Automation" i], nav >> text=Automation, [class*="automation" i], [id*="automation" i], a:has-text("Automation"), button:has-text("Automation")').first();
    
    // Create dropdown - top right corner, try multiple strategies
    // The button shows "+ Create" with a dropdown arrow
    this.createDropdown = page.locator(
      'button:has-text("+ Create"), ' +
      'button:has-text("Create"), ' +
      'button:has-text("+Create"), ' +
      '[aria-label*="Create" i], ' +
      '.create-button, ' +
      'button.dropdown-toggle:has-text("Create"), ' +
      'button[class*="create" i], ' +
      'button[id*="create" i], ' +
      '[data-testid*="create" i], ' +
      'header button:has-text("Create"), ' +
      '[class*="header" i] button:has-text("Create"), ' +
      '[class*="toolbar" i] button:has-text("Create"), ' +
      '[class*="top" i] button:has-text("Create"), ' +
      'button[aria-haspopup="true"]:has-text("Create"), ' +
      'button[aria-haspopup="menu"]'
    ).first();
    
    // Task Bot option in dropdown - shows as "Task Bot..." (with three dots)
    this.taskBotOption = page.locator(
      'text=Task Bot..., ' +
      'text=Task Bot, ' +
      'text=TaskBot, ' +
      '[role="menuitem"]:has-text("Task Bot"), ' +
      '[role="menuitem"]:has-text("Task Bot..."), ' +
      'a:has-text("Task Bot"), ' +
      'a:has-text("Task Bot..."), ' +
      'a:has-text("TaskBot"), ' +
      '[aria-label*="Task Bot" i], ' +
      '[aria-label*="TaskBot" i], ' +
      'li:has-text("Task Bot"), ' +
      'li:has-text("Task Bot..."), ' +
      'div:has-text("Task Bot"), ' +
      'div:has-text("Task Bot...")'
    ).first();
    this.formOption = page.locator('text=Form, [role="menuitem"]:has-text("Form"), a:has-text("Form"), [aria-label*="Form" i], li:has-text("Form"), div:has-text("Form")').first();
    // AI tab - in the left navigation sidebar (it's a button that expands)
    this.aiTab = page.locator(
      'button:has-text("AI"), ' +
      'text=AI, ' +
      '[aria-label*="AI" i], ' +
      '[role="button"]:has-text("AI"), ' +
      'a:has-text("AI")'
    ).first();
    this.learningInstanceOption = page.locator('text=Learning Instance, text=LearningInstance, [aria-label*="Learning Instance" i], [aria-label*="LearningInstance" i], a:has-text("Learning Instance"), a:has-text("LearningInstance")').first();
  }

  /**
   * Navigate to Automation section
   */
  async navigateToAutomation() {
    // Wait for page to be ready first
    await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(1000);
    
    // Try multiple strategies to find and click Automation menu
    const automationSelectors = [
      this.page.locator('nav >> text=Automation').first(),
      this.page.locator('[class*="sidebar" i] >> text=Automation').first(),
      this.page.locator('[class*="menu" i] >> text=Automation').first(),
      this.page.locator('a:has-text("Automation")').first(),
      this.page.locator('button:has-text("Automation")').first(),
      this.automationMenu,
      this.page.locator('text=Automation').first(),
      this.page.locator('[aria-label*="Automation" i]').first()
    ];
    
    let clicked = false;
    for (let i = 0; i < automationSelectors.length; i++) {
      const selector = automationSelectors[i];
      try {
        const count = await selector.count();
        if (count > 0) {
          const isVisible = await selector.isVisible({ timeout: 5000 }).catch(() => false);
          if (isVisible) {
            logger.info(`Trying Automation selector ${i + 1}/${automationSelectors.length}`);
            await selector.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(300);
            await selector.click({ timeout: 10000 });
          clicked = true;
            logger.info('Automation menu clicked successfully');
          break;
          }
        }
      } catch (e) {
        logger.debug(`Automation selector ${i + 1} failed: ${e.message}`);
        // Continue to next selector
      }
    }
    
    if (!clicked) {
      logger.warn('All Automation selectors failed, trying fallback');
      try {
        await this.waitForElement(this.automationMenu, 10000);
      await this.clickElement(this.automationMenu);
        clicked = true;
      } catch (e) {
        logger.error(`Failed to click Automation menu: ${e.message}`);
        throw new Error(`Could not find or click Automation menu: ${e.message}`);
      }
    }
    
    // Wait for page to load - use more lenient strategy
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (e) {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 });
    }
    
    // Additional wait to ensure the Create button is rendered
    await this.page.waitForTimeout(2000);
    
    // Verify we're in Automation section by checking for Create button
    const createButtonVisible = await this.isElementVisible(this.createDropdown, 5000);
    if (!createButtonVisible) {
      logger.warn('Create button not visible after navigating to Automation section');
      // Take screenshot for debugging
      await this.page.screenshot({ path: 'test-results/automation-navigation-failed.png', fullPage: true }).catch(() => {});
    } else {
      logger.info('Navigated to Automation section - Create button is visible');
    }
  }

  /**
   * Click on Create dropdown (top right corner)
   * The button shows "+ Create" with a dropdown arrow
   */
  async clickCreateDropdown() {
    try {
      logger.info('=== clickCreateDropdown() called ===');
      logger.info(`Current URL: ${this.page.url()}`);
      
      // Simple wait for page to be ready
      await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      await this.page.waitForTimeout(3000); // Give page time to render
      
      logger.info('Attempting to find and click Create button...');
    
    // Simplified approach: Find all Create buttons and click the first visible one
    logger.info('Finding all Create buttons on the page...');
    const allCreateButtons = this.page.locator('button:has-text("Create")');
    const totalCount = await allCreateButtons.count();
    logger.info(`Found ${totalCount} button(s) with "Create" text on the page`);
    
    let clicked = false;
    let lastError = null;
    
    // Try each Create button until we find one that's visible and clickable
    for (let i = 0; i < totalCount; i++) {
      const button = allCreateButtons.nth(i);
      try {
        const isVisible = await button.isVisible({ timeout: 3000 }).catch(() => false);
        const text = await button.textContent().catch(() => 'N/A');
        logger.info(`Create button ${i}: visible=${isVisible}, text="${text.trim()}"`);
        
        if (isVisible) {
          logger.info(`Attempting to click Create button ${i}...`);
          await button.scrollIntoViewIfNeeded();
          await this.page.waitForTimeout(500);
          
          try {
            await button.click({ timeout: 10000, force: false });
            clicked = true;
            logger.info(`Successfully clicked Create button ${i}`);
            break;
          } catch (clickError) {
            logger.warn(`Regular click failed for button ${i}, trying force click: ${clickError.message}`);
            try {
              await button.click({ timeout: 10000, force: true });
              clicked = true;
              logger.info(`Successfully clicked Create button ${i} with force click`);
              break;
            } catch (forceError) {
              logger.warn(`Force click also failed for button ${i}: ${forceError.message}`);
              lastError = forceError;
            }
          }
        }
      } catch (e) {
        logger.debug(`Could not process button ${i}: ${e.message}`);
        lastError = e;
      }
    }
    
    if (!clicked) {
      // Take screenshot for debugging
      await this.page.screenshot({ path: 'test-results/create-button-failed.png', fullPage: true });
      logger.error(`Failed to click any Create button. Found ${totalCount} buttons total.`);
      throw new Error(`Failed to click Create dropdown button. Found ${totalCount} button(s) but none were clickable. Last error: ${lastError?.message || 'Unknown error'}`);
    }
    
    // Wait for dropdown menu to appear
    await this.page.waitForTimeout(1500);
    
    // Verify dropdown is open by checking for menu items
    try {
      const menuSelectors = [
        this.page.locator('[role="menu"]').first(),
        this.page.locator('[class*="dropdown-menu" i]').first(),
        this.page.locator('text=Task Bot...').first(),
        this.page.locator('text=Task Bot').first()
      ];
      
      let menuVisible = false;
      for (const menuSelector of menuSelectors) {
        try {
          await menuSelector.waitFor({ state: 'visible', timeout: 3000 });
          menuVisible = true;
          logger.info('Dropdown menu is now visible');
          break;
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!menuVisible) {
        logger.warn('Dropdown menu visibility check timed out, but proceeding');
      }
    } catch (e) {
      logger.warn('Could not verify dropdown menu visibility');
    }
    } catch (error) {
      logger.error(`Error in clickCreateDropdown: ${error.message}`);
      logger.error(`Stack trace: ${error.stack}`);
      // Take screenshot for debugging
      await this.page.screenshot({ path: 'test-results/create-button-error.png', fullPage: true }).catch(() => {});
      throw error;
    }
  }

  /**
   * Select Task Bot from Create dropdown
   * The option shows as "Task Bot..." (with three dots)
   */
  async selectTaskBot() {
    logger.info('=== Starting selectTaskBot - will click Create dropdown first ===');
    logger.info(`Current URL: ${this.page.url()}`);
    
    try {
      logger.info('Calling clickCreateDropdown()...');
      await this.clickCreateDropdown();
      logger.info('clickCreateDropdown() completed successfully');
    } catch (error) {
      logger.error(`Failed to click Create dropdown in selectTaskBot: ${error.message}`);
      logger.error(`Error stack: ${error.stack}`);
      // Take screenshot before throwing
      await this.page.screenshot({ path: 'test-results/selectTaskBot-error.png', fullPage: true }).catch(() => {});
      throw error;
    }
    
    // Wait for dropdown menu to be visible
    const dropdownMenu = this.page.locator('[role="menu"], [class*="dropdown-menu" i], [class*="menu" i], ul[class*="dropdown" i]').first();
    try {
      await dropdownMenu.waitFor({ state: 'visible', timeout: 5000 });
      logger.info('Dropdown menu is visible');
      
      // Keep dropdown open by hovering over it
      try {
        await dropdownMenu.hover({ timeout: 2000 });
        logger.info('Hovered over dropdown menu to keep it open');
      } catch (hoverError) {
        logger.debug(`Could not hover over dropdown: ${hoverError.message}`);
      }
    } catch (e) {
      logger.debug('Dropdown menu container not found, proceeding with option selection');
    }
    
    // Take screenshot after dropdown opens for debugging
    await this.page.screenshot({ path: 'test-results/dropdown-opened.png', fullPage: true }).catch(() => {});
    
    // Prevent dropdown from closing by disabling pointer events temporarily (if needed)
    try {
      await this.page.evaluate(() => {
        // Try to prevent dropdown from closing
        const menus = document.querySelectorAll('[role="menu"], [class*="dropdown-menu"], [class*="menu"]');
        menus.forEach(menu => {
          if (menu.style) {
            menu.style.pointerEvents = 'auto';
          }
        });
      });
    } catch (e) {
      // Ignore errors
    }
    
    // Initialize clicked variable
    let clicked = false;
    
    // First, try to find all menu items and click the one with "Task Bot..."
    logger.info('Looking for Task Bot option in dropdown menu...');
    try {
      // Wait a bit more for dropdown to fully render
      await this.page.waitForTimeout(2000);
      
      // Log ALL visible text on the page to help debug
      logger.info('=== DEBUGGING: Logging all visible menu items ===');
      
      // Try multiple selectors for menu items
      const menuItemSelectors = [
        '[role="menuitem"]',
        '[role="menu"] > *',
        '[class*="dropdown-menu" i] > *',
        '[class*="menu" i] > *',
        'li[role="menuitem"]',
        'a[role="menuitem"]',
        'div[role="menuitem"]',
        'button[role="menuitem"]',
      ];
      
      let allMenuItems = null;
      let itemCount = 0;
      
      // Try to find menu items using different selectors
      for (const selector of menuItemSelectors) {
        try {
          const items = this.page.locator(selector);
          const count = await items.count();
          if (count > 0) {
            allMenuItems = items;
            itemCount = count;
            logger.info(`Found ${itemCount} menu items using selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (allMenuItems && itemCount > 0) {
        // Log all menu items for debugging
        for (let i = 0; i < itemCount; i++) {
          const item = allMenuItems.nth(i);
          try {
            const isVisible = await item.isVisible({ timeout: 1000 }).catch(() => false);
            let text = await item.textContent({ timeout: 1000 }).catch(() => '');
            if (!text || text.trim() === '') {
              text = await item.evaluate(el => el.innerText || el.textContent || '').catch(() => '');
            }
            const tagName = await item.evaluate(el => el.tagName).catch(() => 'unknown');
            const className = await item.getAttribute('class').catch(() => '');
            logger.info(`Menu item ${i}: tag="${tagName}", text="${text?.trim()}", visible=${isVisible}, class="${className}"`);
          } catch (e) {
            logger.debug(`Could not get details for menu item ${i}: ${e.message}`);
          }
        }
      
      for (let i = 0; i < itemCount; i++) {
        const item = allMenuItems.nth(i);
        try {
            // Get text content - try multiple ways
            let text = await item.textContent({ timeout: 2000 }).catch(() => '');
            if (!text || text.trim() === '') {
              // Try innerText as fallback
              text = await item.evaluate(el => el.innerText || el.textContent || '').catch(() => '');
            }
            
            // Also try getting text from child elements
            if (!text || text.trim() === '') {
              const childText = await item.locator('*').first().textContent({ timeout: 1000 }).catch(() => '');
              if (childText) text = childText;
            }
            
            const trimmedText = text?.trim() || '';
            logger.info(`Checking menu item ${i}: "${trimmedText}"`);
            
            // Check if it matches Task Bot (case-insensitive, with or without dots, handle ellipsis)
            const normalizedText = trimmedText.toLowerCase().replace(/\.{3,}/g, '...').replace(/\s+/g, ' ');
            const matchesTaskBot = normalizedText && (
              normalizedText.includes('task bot') ||
              normalizedText.includes('taskbot') ||
              normalizedText === 'task bot' ||
              normalizedText === 'task bot...' ||
              normalizedText.startsWith('task bot') ||
              normalizedText.includes('task') && normalizedText.includes('bot')
            );
            
            if (matchesTaskBot) {
              const isVisible = await item.isVisible({ timeout: 3000 }).catch(() => false);
              const isEnabled = await item.isEnabled().catch(() => true);
              
              logger.info(`✓ Found Task Bot option at index ${i} (visible: ${isVisible}, enabled: ${isEnabled}, text: "${trimmedText}")`);
              
            if (isVisible) {
                // Ensure dropdown stays open by hovering over it first
                try {
                  await dropdownMenu.hover().catch(() => {});
                } catch (e) {
                  // Ignore hover errors
                }
                
              await item.scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(500);
                
                // Try hovering over the item first to keep dropdown open
                try {
                  await item.hover({ timeout: 3000 });
              await this.page.waitForTimeout(300);
                } catch (hoverError) {
                  logger.debug(`Hover failed: ${hoverError.message}`);
                }
                
                // Try clicking with different strategies
                try {
                  await item.click({ timeout: 10000, force: false });
                  clicked = true;
                  logger.info('✓ Task Bot option clicked successfully (regular click)');
                  break;
                } catch (clickError) {
                  logger.warn(`Regular click failed: ${clickError.message}, trying force click`);
                  try {
                    await item.click({ timeout: 10000, force: true });
                    clicked = true;
                    logger.info('✓ Task Bot option clicked successfully (force click)');
                    break;
                  } catch (forceError) {
                    logger.warn(`Force click failed: ${forceError.message}, trying JavaScript click`);
                    try {
                      await item.evaluate(el => {
                        // Try multiple click methods
                        if (el.click) el.click();
                        else if (el.dispatchEvent) {
                          el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                        }
                      });
                      clicked = true;
                      logger.info('✓ Task Bot option clicked successfully (JavaScript click)');
                      break;
                    } catch (jsError) {
                      logger.warn(`JavaScript click failed: ${jsError.message}`);
                      // Try keyboard navigation as last resort
                      try {
                        await item.focus();
                        await this.page.keyboard.press('Enter');
              clicked = true;
                        logger.info('✓ Task Bot option activated using keyboard (Enter)');
              break;
                      } catch (keyError) {
                        logger.warn(`Keyboard navigation failed: ${keyError.message}`);
                      }
                    }
                  }
                }
              } else {
                logger.warn(`Task Bot option found but not visible at index ${i}`);
              }
            }
          } catch (e) {
            logger.debug(`Error processing menu item ${i}: ${e.message}`);
            // Continue to next item
          }
        }
      } else {
        logger.warn('Could not find any menu items in dropdown');
        // Take screenshot for debugging
        await this.page.screenshot({ path: 'test-results/no-menu-items.png', fullPage: true }).catch(() => {});
      }
    } catch (e) {
      logger.debug(`Could not find Task Bot in menu items: ${e.message}`);
    }
    
    // If not found in menu items, try multiple selectors for Task Bot option (with and without dots)
    // The dropdown shows "Task Bot..." with three dots
    if (!clicked) {
      const taskBotSelectors = [
      // Exact text match first
      this.page.locator('text="Task Bot..."').first(),
      this.page.locator('text=Task Bot...').first(),
      // Try with role menuitem
      this.page.locator('[role="menuitem"]:has-text("Task Bot...")').first(),
      this.page.locator('[role="menuitem"] >> text="Task Bot..."').first(),
      // Try in dropdown menu
      this.page.locator('[role="menu"] >> text="Task Bot..."').first(),
      this.page.locator('[class*="dropdown-menu" i] >> text="Task Bot..."').first(),
      this.page.locator('[class*="menu" i] >> text="Task Bot..."').first(),
      // Try list items
      this.page.locator('li:has-text("Task Bot...")').first(),
      this.page.locator('li >> text="Task Bot..."').first(),
      // Try div elements
      this.page.locator('div:has-text("Task Bot...")').first(),
      // Try without quotes (fallback)
      this.taskBotOption,
      this.page.locator('text=Task Bot').first(),
      this.page.locator('[role="menuitem"]:has-text("Task Bot")').first()
    ];
    
    for (let i = 0; i < taskBotSelectors.length; i++) {
      const selector = taskBotSelectors[i];
      try {
        // Check if element exists
        const count = await selector.count();
        logger.debug(`Task Bot selector ${i + 1}: found ${count} element(s)`);
        
        if (count > 0) {
          const isVisible = await selector.isVisible({ timeout: 3000 }).catch(() => false);
          logger.debug(`Task Bot selector ${i + 1}: visible=${isVisible}`);
          
          if (isVisible) {
            logger.info(`Trying Task Bot selector ${i + 1}/${taskBotSelectors.length}`);
            await selector.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(300);
            await selector.click({ timeout: 10000 });
            clicked = true;
            logger.info(`Task Bot option clicked successfully with selector ${i + 1}`);
            break;
          }
        }
      } catch (e) {
        logger.debug(`Failed to click Task Bot selector ${i + 1}: ${e.message}`);
        // Continue to next selector
      }
    }
    }
    
    if (!clicked) {
      // Fallback: wait and try the default selector
      logger.warn('Trying fallback selector for Task Bot option');
      try {
        await this.waitForElement(this.taskBotOption, 10000);
        await this.taskBotOption.scrollIntoViewIfNeeded();
        await this.clickElement(this.taskBotOption);
        clicked = true;
        logger.info('Task Bot option clicked using fallback selector');
      } catch (e) {
        logger.error(`Failed to click Task Bot option even with fallback: ${e.message}`);
        throw new Error(`Could not click Task Bot option: ${e.message}`);
      }
    }
    
    if (!clicked) {
      throw new Error('Failed to click Task Bot option after trying all selectors');
    }
    
    // Wait for the modal/form to appear
    logger.info('Waiting for Task Bot creation modal/form to appear...');
    
    // Wait a bit for any navigation or modal animation
    await this.page.waitForTimeout(3000);
    
    // Check if we navigated to a new page (some UIs navigate instead of showing modal)
    const currentUrl = this.page.url();
    logger.info(`Current URL after clicking Task Bot: ${currentUrl}`);
    
    // Wait for page to be stable
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    } catch (e) {
      logger.debug('Load state timeout, continuing');
    }
    
    // Try multiple strategies to find the Task Bot creation form
    let formFound = false;
    const formSelectors = [
      // Input field selectors (most reliable)
      this.page.locator('input[name*="name" i]').first(),
      this.page.locator('input[placeholder*="name" i]').first(),
      this.page.locator('input[placeholder*="Name" i]').first(),
      this.page.locator('input[placeholder*="Untitled" i]').first(),
      this.page.locator('input[id*="name" i]').first(),
      // Modal/dialog selectors
      this.page.locator('[role="dialog"]').first(),
      this.page.locator('.modal').first(),
      this.page.locator('[class*="modal" i]').first(),
      // Heading selectors
      this.page.locator('h1:has-text("Create Task Bot")').first(),
      this.page.locator('h1:has-text("Task Bot")').first(),
      this.page.locator('h2:has-text("Create Task Bot")').first(),
      // Form container selectors
      this.page.locator('form').first(),
      this.page.locator('[class*="form" i]').first(),
    ];
    
    for (let i = 0; i < formSelectors.length; i++) {
      const selector = formSelectors[i];
      try {
        const isVisible = await selector.isVisible({ timeout: 5000 }).catch(() => false);
        if (isVisible) {
          logger.info(`Task Bot form found using selector ${i + 1} (${formSelectors.length}): ${selector}`);
          formFound = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!formFound) {
      // Take screenshot for debugging
      await this.page.screenshot({ path: 'test-results/taskbot-modal-not-found.png', fullPage: true }).catch(() => {});
      logger.warn('Task Bot creation form not found with standard selectors');
      logger.warn('This might be okay if the form appears on a different page or with different structure');
    } else {
      logger.info('Task Bot creation form is visible');
    }
    
    // Additional wait for form to fully render
    await this.page.waitForTimeout(2000);
    logger.info('selectTaskBot completed - form should be visible now');
  }

  /**
   * Select Form from Create dropdown
   */
  async selectForm() {
    logger.info('=== Starting selectForm - will click Create dropdown first ===');
    logger.info(`Current URL: ${this.page.url()}`);
    
    try {
      logger.info('Calling clickCreateDropdown()...');
    await this.clickCreateDropdown();
      logger.info('clickCreateDropdown() completed successfully');
    } catch (error) {
      logger.error(`Failed to click Create dropdown in selectForm: ${error.message}`);
      throw error;
    }
    
    // Wait for dropdown menu to be visible
    const formDropdownMenu = this.page.locator('[role="menu"], [class*="dropdown-menu" i], [class*="menu" i], ul[class*="dropdown" i]').first();
    try {
      await formDropdownMenu.waitFor({ state: 'visible', timeout: 5000 });
      logger.info('Form dropdown menu is visible');
      
      // Keep dropdown open by hovering over it
      try {
        await formDropdownMenu.hover({ timeout: 2000 });
        logger.info('Hovered over dropdown menu to keep it open');
      } catch (hoverError) {
        logger.debug(`Could not hover over dropdown: ${hoverError.message}`);
      }
    } catch (e) {
      logger.debug('Form dropdown menu container not found, proceeding with option selection');
    }
    
    await this.page.waitForTimeout(2000);
    
    // Take screenshot after dropdown opens for debugging
    await this.page.screenshot({ path: 'test-results/form-dropdown-opened.png', fullPage: true }).catch(() => {});
    
    // Prevent dropdown from closing
    try {
      await this.page.evaluate(() => {
        const menus = document.querySelectorAll('[role="menu"], [class*="dropdown-menu"], [class*="menu"]');
        menus.forEach(menu => {
          if (menu.style) {
            menu.style.pointerEvents = 'auto';
          }
        });
      });
    } catch (e) {
      // Ignore errors
    }
    
    // Initialize clicked variable
    let clicked = false;
    
    // First, try to find all menu items and click the one with "Form"
    logger.info('Looking for Form option in dropdown menu...');
    try {
      // Try multiple selectors for menu items
      const menuItemSelectors = [
        '[role="menuitem"]',
        '[role="menu"] > *',
        '[class*="dropdown-menu" i] > *',
        '[class*="menu" i] > *',
        'li[role="menuitem"]',
        'a[role="menuitem"]',
        'div[role="menuitem"]',
        'button[role="menuitem"]',
      ];
      
      let allMenuItems = null;
      let itemCount = 0;
      
      // Try to find menu items using different selectors
      for (const selector of menuItemSelectors) {
        try {
          const items = this.page.locator(selector);
          const count = await items.count();
          if (count > 0) {
            allMenuItems = items;
            itemCount = count;
            logger.info(`Found ${itemCount} menu items using selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (allMenuItems && itemCount > 0) {
        logger.info(`Found ${itemCount} menu items, checking each one for "Form"...`);
        // Log all menu items for debugging
        for (let i = 0; i < itemCount; i++) {
          const item = allMenuItems.nth(i);
          try {
            const isVisible = await item.isVisible({ timeout: 1000 }).catch(() => false);
            let text = await item.textContent({ timeout: 1000 }).catch(() => '');
            if (!text || text.trim() === '') {
              text = await item.evaluate(el => el.innerText || el.textContent || '').catch(() => '');
            }
            if (!text || text.trim() === '') {
              // Try getting text from child elements
              const childText = await item.locator('*').first().textContent({ timeout: 1000 }).catch(() => '');
              if (childText) text = childText;
            }
            const tagName = await item.evaluate(el => el.tagName).catch(() => 'unknown');
            const classAttr = await item.getAttribute('class').catch(() => '');
            const role = await item.getAttribute('role').catch(() => '');
            logger.info(`Menu item ${i}: tag="${tagName}", role="${role}", text="${text?.trim()}", visible=${isVisible}, class="${classAttr}"`);
          } catch (e) {
            logger.debug(`Could not get details for menu item ${i}: ${e.message}`);
          }
        }
        
        for (let i = 0; i < itemCount; i++) {
          const item = allMenuItems.nth(i);
          try {
            // Get text content - try multiple ways
            let text = await item.textContent({ timeout: 2000 }).catch(() => '');
            if (!text || text.trim() === '') {
              // Try innerText as fallback
              text = await item.evaluate(el => el.innerText || el.textContent || '').catch(() => '');
            }
            
            // Also try getting text from child elements
            if (!text || text.trim() === '') {
              const childText = await item.locator('*').first().textContent({ timeout: 1000 }).catch(() => '');
              if (childText) text = childText;
            }
            
            const trimmedText = text?.trim() || '';
            logger.info(`Checking menu item ${i}: "${trimmedText}"`);
            
            // Check if it matches Form (case-insensitive, handle variations)
            const normalizedText = trimmedText.toLowerCase().trim();
            // Remove any trailing ellipsis or extra characters
            const cleanText = normalizedText.replace(/\.{3,}/g, '').trim();
            const matchesForm = normalizedText && (
              normalizedText === 'form' ||
              cleanText === 'form' ||
              normalizedText.includes('form') ||
              normalizedText.startsWith('form') ||
              normalizedText.endsWith('form') ||
              // Handle variations like "Forms", "Form...", etc.
              (normalizedText.match(/^form/i) && !normalizedText.includes('task') && !normalizedText.includes('bot'))
            );
            
            if (matchesForm) {
              const isVisible = await item.isVisible({ timeout: 3000 }).catch(() => false);
              const isEnabled = await item.isEnabled().catch(() => true);
              
              logger.info(`✓ Found Form option at index ${i} (visible: ${isVisible}, enabled: ${isEnabled}, text: "${trimmedText}")`);
              
              if (isVisible) {
                // Ensure dropdown stays open by hovering over it first
                try {
                  await formDropdownMenu.hover().catch(() => {});
                } catch (e) {
                  // Ignore hover errors
                }
                
                await item.scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(500);
                
                // Try hovering over the item first to keep dropdown open
                try {
                  await item.hover({ timeout: 3000 });
                  await this.page.waitForTimeout(300);
                } catch (hoverError) {
                  logger.debug(`Hover failed: ${hoverError.message}`);
                }
                
                // Try clicking with different strategies
                try {
                  await item.click({ timeout: 10000, force: false });
                  clicked = true;
                  logger.info('✓ Form option clicked successfully (regular click)');
                  break;
                } catch (clickError) {
                  logger.warn(`Regular click failed: ${clickError.message}, trying force click`);
                  try {
                    await item.click({ timeout: 10000, force: true });
                    clicked = true;
                    logger.info('✓ Form option clicked successfully (force click)');
                    break;
                  } catch (forceError) {
                    logger.warn(`Force click failed: ${forceError.message}, trying JavaScript click`);
                    try {
                      await item.evaluate(el => {
                        // Try multiple click methods
                        if (el.click) el.click();
                        else if (el.dispatchEvent) {
                          el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                        }
                      });
                      clicked = true;
                      logger.info('✓ Form option clicked successfully (JavaScript click)');
                      break;
                    } catch (jsError) {
                      logger.warn(`JavaScript click failed: ${jsError.message}`);
                      // Try keyboard navigation as last resort
                      try {
                        await item.focus();
                        await this.page.keyboard.press('Enter');
                        clicked = true;
                        logger.info('✓ Form option activated using keyboard (Enter)');
                        break;
                      } catch (keyError) {
                        logger.warn(`Keyboard navigation failed: ${keyError.message}`);
                      }
                    }
                  }
                }
              } else {
                logger.warn(`Form option found but not visible at index ${i}`);
              }
            }
          } catch (e) {
            logger.debug(`Error processing menu item ${i}: ${e.message}`);
            // Continue to next item
          }
        }
      } else {
        logger.warn('Could not find any menu items in dropdown');
        await this.page.screenshot({ path: 'test-results/form-no-menu-items.png', fullPage: true }).catch(() => {});
      }
    } catch (e) {
      logger.debug(`Could not find Form in menu items: ${e.message}`);
    }
    
    // If not found in menu items, try multiple selectors for Form option
    if (!clicked) {
      logger.info('Trying fallback selectors for Form option...');
      const formSelectors = [
        this.page.locator('text=Form').first(),
        this.page.locator('text=/^Form$/i').first(),
        this.page.locator('[role="menuitem"]:has-text("Form")').first(),
        this.page.locator('[role="menuitem"]:has-text(/^Form$/i)').first(),
        this.page.locator('[role="menu"] >> text=Form').first(),
        this.page.locator('[class*="dropdown-menu" i] >> text=Form').first(),
        this.page.locator('li:has-text("Form")').first(),
        this.page.locator('a:has-text("Form")').first(),
        this.page.locator('button:has-text("Form")').first(),
        this.page.locator('div:has-text("Form")').first(),
        this.formOption,
      ];
      
      for (let i = 0; i < formSelectors.length; i++) {
        const selector = formSelectors[i];
        try {
          const count = await selector.count();
          logger.info(`Form selector ${i + 1}: found ${count} element(s)`);
          if (count > 0) {
            // Check all matching elements
            for (let j = 0; j < count; j++) {
              const element = selector.nth(j);
              try {
                const isVisible = await element.isVisible({ timeout: 3000 }).catch(() => false);
                const text = await element.textContent().catch(() => '');
                logger.info(`  Element ${j}: visible=${isVisible}, text="${text?.trim()}"`);
                
                if (isVisible) {
                  // Verify it's actually "Form" and not something else
                  const elementText = text?.trim().toLowerCase() || '';
                  if (elementText.includes('form') && !elementText.includes('task') && !elementText.includes('bot')) {
                    logger.info(`Trying Form selector ${i + 1}, element ${j}`);
                    await element.scrollIntoViewIfNeeded();
                    await this.page.waitForTimeout(300);
                    
                    // Try multiple click strategies
                    try {
                      await element.click({ timeout: 10000 });
                      clicked = true;
                      logger.info(`✓ Form option clicked successfully with selector ${i + 1}, element ${j} (regular click)`);
                      break;
                    } catch (clickError) {
                      logger.debug(`Regular click failed: ${clickError.message}, trying force click`);
                      try {
                        await element.click({ timeout: 10000, force: true });
                        clicked = true;
                        logger.info(`✓ Form option clicked successfully with selector ${i + 1}, element ${j} (force click)`);
                        break;
                      } catch (forceError) {
                        logger.debug(`Force click failed: ${forceError.message}`);
                        try {
                          await element.evaluate(el => el.click());
                          clicked = true;
                          logger.info(`✓ Form option clicked successfully with selector ${i + 1}, element ${j} (JavaScript click)`);
                          break;
                        } catch (jsError) {
                          logger.debug(`JavaScript click failed: ${jsError.message}`);
                        }
                      }
                    }
                  }
                }
              } catch (e) {
                logger.debug(`Error checking element ${j} of selector ${i + 1}: ${e.message}`);
              }
            }
            if (clicked) break;
          }
        } catch (e) {
          logger.debug(`Failed to check Form selector ${i + 1}: ${e.message}`);
        }
      }
    }
    
    if (!clicked) {
      // Fallback: wait and try the default selector
      logger.warn('Trying fallback selector for Form option');
      try {
        await this.waitForElement(this.formOption, 10000);
    await this.clickElement(this.formOption);
        clicked = true;
        logger.info('Form option clicked using fallback selector');
      } catch (e) {
        logger.error(`Failed to click Form option even with fallback: ${e.message}`);
        throw new Error(`Could not click Form option: ${e.message}`);
      }
    }
    
    // Wait for Form creation form to appear
    logger.info('Waiting for Form creation form to appear...');
    
    // Wait a bit for any navigation or modal animation
    await this.page.waitForTimeout(3000);
    
    // Check if we navigated to a new page
    const currentUrl = this.page.url();
    logger.info(`Current URL after clicking Form: ${currentUrl}`);
    
    // Wait for page to be stable
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    } catch (e) {
      logger.debug('Load state timeout, continuing');
    }
    
    // Try multiple strategies to find the Form creation form
    let formFound = false;
    const formSelectors = [
      // Input field selectors (most reliable)
      this.page.locator('input[name*="name" i]').first(),
      this.page.locator('input[placeholder*="name" i]').first(),
      this.page.locator('input[placeholder*="Name" i]').first(),
      this.page.locator('input[placeholder*="Untitled" i]').first(),
      this.page.locator('input[id*="name" i]').first(),
      // Modal/dialog selectors
      this.page.locator('[role="dialog"]').first(),
      this.page.locator('.modal').first(),
      this.page.locator('[class*="modal" i]').first(),
      // Heading selectors
      this.page.locator('h1:has-text("Create Form")').first(),
      this.page.locator('h1:has-text("Form")').first(),
      this.page.locator('h2:has-text("Create Form")').first(),
      // Form container selectors
      this.page.locator('form').first(),
      this.page.locator('[class*="form" i]').first(),
    ];
    
    for (let i = 0; i < formSelectors.length; i++) {
      const selector = formSelectors[i];
      try {
        const isVisible = await selector.isVisible({ timeout: 5000 }).catch(() => false);
        if (isVisible) {
          logger.info(`Form creation form found using selector ${i + 1} (${formSelectors.length}): ${selector}`);
          formFound = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!formFound) {
      // Take screenshot for debugging
      await this.page.screenshot({ path: 'test-results/form-modal-not-found.png', fullPage: true }).catch(() => {});
      logger.warn('Form creation form not found with standard selectors');
      logger.warn('This might be okay if the form appears on a different page or with different structure');
    } else {
      logger.info('Form creation form is visible');
    }
    
    // Additional wait for form to fully render
    await this.page.waitForTimeout(2000);
    logger.info('selectForm completed - form should be visible now');
  }

  /**
   * Navigate to AI tab -> Document Automation (Learning Instance page)
   */
  async navigateToLearningInstance() {
    logger.info('Navigating to AI tab');
    
    // Wait for page to be ready
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000);
    
    // Try multiple selectors for AI tab (it's a button in the left sidebar)
    const aiSelectors = [
      this.page.locator('button:has-text("AI")').first(),
      this.page.locator('text=AI').first(),
      this.page.locator('[aria-label*="AI" i]').first(),
      this.page.locator('nav button:has-text("AI")').first(),
      this.page.locator('[role="button"]:has-text("AI")').first(),
      this.aiTab
    ];
    
    let clicked = false;
    for (let i = 0; i < aiSelectors.length; i++) {
      const selector = aiSelectors[i];
      try {
        const count = await selector.count();
        if (count > 0) {
          const isVisible = await selector.isVisible({ timeout: 3000 }).catch(() => false);
          if (isVisible) {
            logger.info(`Trying AI tab selector ${i + 1}/${aiSelectors.length}`);
            await selector.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(300);
            await selector.click({ timeout: 10000 });
            clicked = true;
            logger.info('AI tab clicked successfully');
            break;
          }
        }
      } catch (e) {
        logger.debug(`AI selector ${i + 1} failed: ${e.message}`);
        // Continue to next selector
      }
    }
    
    if (!clicked) {
      logger.warn('All AI tab selectors failed, trying fallback');
      try {
        await this.waitForElement(this.aiTab, 10000);
        await this.clickElement(this.aiTab);
        clicked = true;
      } catch (e) {
        logger.error(`Failed to click AI tab: ${e.message}`);
        throw new Error(`Could not find or click AI tab: ${e.message}`);
      }
    }
    
    await this.page.waitForTimeout(1500); // Wait for AI menu to expand
    
    // Click on "Document Automation" option (sub-menu item that appears after clicking AI)
    logger.info('Looking for Document Automation option in AI submenu');
    
    const documentAutomationSelectors = [
      this.page.locator('text=Document Automation').first(),
      this.page.locator('[role="menuitem"]:has-text("Document Automation")').first(),
      this.page.locator('a:has-text("Document Automation")').first(),
      this.page.locator('li:has-text("Document Automation")').first(),
      this.page.locator('div:has-text("Document Automation")').first(),
      this.page.locator('link:has-text("Document Automation")').first()
    ];
    
    let documentAutomationClicked = false;
    for (let i = 0; i < documentAutomationSelectors.length; i++) {
      const selector = documentAutomationSelectors[i];
      try {
        const count = await selector.count();
        if (count > 0) {
          const isVisible = await selector.isVisible({ timeout: 3000 }).catch(() => false);
          if (isVisible) {
            logger.info(`Trying Document Automation selector ${i + 1}/${documentAutomationSelectors.length}`);
            await selector.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(300);
            await selector.click({ timeout: 10000 });
            documentAutomationClicked = true;
            logger.info('Clicked Document Automation successfully');
            break;
          }
        }
      } catch (e) {
        logger.debug(`Document Automation selector ${i + 1} failed: ${e.message}`);
        // Continue to next selector
      }
    }
    
    if (!documentAutomationClicked) {
      logger.warn('Document Automation not found with standard selectors, trying fallback');
      // Try to find all links/items in the expanded AI menu
      const allMenuItems = this.page.locator('[role="menuitem"], li > a, [class*="menu-item" i] > a');
      const itemCount = await allMenuItems.count();
      logger.info(`Found ${itemCount} menu items in AI submenu`);
      
      for (let i = 0; i < itemCount; i++) {
        const item = allMenuItems.nth(i);
        try {
          const text = await item.textContent();
          logger.debug(`Menu item ${i}: "${text?.trim()}"`);
          if (text && (text.includes('Document Automation') || text.includes('Document') || text.includes('Learning'))) {
            const isVisible = await item.isVisible({ timeout: 2000 }).catch(() => false);
            if (isVisible) {
              logger.info(`Found Document Automation at index ${i}, clicking...`);
              await item.scrollIntoViewIfNeeded();
              await this.page.waitForTimeout(300);
              await item.click({ timeout: 10000 });
              documentAutomationClicked = true;
              logger.info('Clicked Document Automation by finding in menu items');
              break;
            }
          }
        } catch (e) {
          // Continue to next item
        }
      }
    }
    
    if (!documentAutomationClicked) {
      logger.error('Could not find Document Automation option');
      throw new Error('Document Automation option not found after clicking AI tab');
    }
    
    // Wait for the Learning Instances page to load
    // Check for URL change to learning-instances
    try {
      await this.page.waitForURL(/.*\/learning-instances.*/i, { timeout: 15000 });
      logger.info('URL indicates Learning Instances page is loaded');
    } catch (e) {
      logger.warn(`URL check for Learning Instances page timed out: ${e.message}, proceeding with element check.`);
    }
    
    // Wait for the "Learning Instances" heading to be visible
    try {
      await this.page.waitForSelector('h1:has-text("Learning Instances")', { state: 'visible', timeout: 15000 });
      logger.info('Learning Instances heading is visible');
    } catch (e) {
      logger.warn(`Learning Instances heading not found: ${e.message}`);
    }
    
    // Also wait for one of the red warning messages as an indicator
    try {
      await this.page.waitForSelector('text=/Select.*Create Learning Instance.*extract data/i, text=/Community edition users are limited/i', { state: 'visible', timeout: 10000 }).catch(() => {
        // Try individual selectors
        return Promise.race([
          this.page.waitForSelector('text=/Select.*Create Learning Instance/i', { state: 'visible', timeout: 5000 }),
          this.page.waitForSelector('text=/Community edition users are limited/i', { state: 'visible', timeout: 5000 })
        ]);
      });
      logger.info('Learning Instances page warning messages are visible');
    } catch (e) {
      logger.debug(`Warning messages not found: ${e.message}, but this is optional`);
    }
    
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000); // Additional wait for dynamic content
    logger.info('Navigated to Document Automation / Learning Instances page');
  }
}

module.exports = { AutomationPage };

