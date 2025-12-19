const { BasePage } = require('./BasePage');
const logger = require('../utils/logger');

/**
 * Form Page Object Model
 * Handles Form creation and file upload functionality
 */
class FormPage extends BasePage {
  constructor(page) {
    super(page);
    // Form creation form - comprehensive selectors
    this.formNameInput = page.locator('input[name*="name" i], input[id*="name" i], input[placeholder*="name" i], input[aria-label*="name" i]').first();
    this.formDescriptionInput = page.locator('textarea[name*="description" i], textarea[id*="description" i], textarea[placeholder*="description" i]').first();
    this.createButton = page.locator('button:has-text("Create"), button[type="submit"]:has-text("Create"), button[id*="create" i]').first();
    this.cancelButton = page.locator('button:has-text("Cancel"), button[id*="cancel" i]').first();
    this.successMessage = page.locator('.success, .alert-success, [role="alert"]:has-text("success" i), [class*="success" i]').first();

    // Canvas and elements - comprehensive selectors
    this.canvas = page.locator('[class*="canvas" i], [class*="Canvas" i], [id*="canvas" i], main, [class*="workspace" i], [class*="editor" i]').first();
    this.elementsMenu = page.locator('[class*="elements" i], [class*="Elements" i], [class*="components" i], aside, [class*="sidebar" i], [class*="palette" i]').first();
    this.textboxElement = page.locator('text=Textbox, text=Text Box, [title*="Textbox" i], [aria-label*="Textbox" i], [data-element="textbox"], [data-type="textbox"]').first();
    this.selectFileElement = page.locator('text=Select File, text=File Upload, text=File, [title*="File" i], [aria-label*="File" i], [data-element="file"], [data-type="file"]').first();

    // Textbox configuration panel - comprehensive selectors
    this.textboxPanel = page.locator('[class*="panel" i], [class*="Panel" i], [class*="properties" i], [class*="config" i]').first();
    this.textboxLabelInput = page.locator('input[name*="label" i], input[id*="label" i], input[placeholder*="label" i]').first();
    this.textboxPlaceholderInput = page.locator('input[name*="placeholder" i], input[id*="placeholder" i], input[placeholder*="placeholder" i]').first();
    this.textboxRequiredCheckbox = page.locator('input[type="checkbox"][name*="required" i], input[type="checkbox"][id*="required" i], input[type="checkbox"][aria-label*="required" i]').first();
    this.textboxValueInput = page.locator('input[type="text"], input[type="input"], textarea, input:not([type="hidden"]):not([type="file"])').first();

    // File Upload configuration panel - comprehensive selectors
    this.fileUploadPanel = page.locator('[class*="panel" i], [class*="Panel" i], [class*="properties" i], [class*="config" i]').first();
    this.fileUploadLabelInput = page.locator('input[name*="label" i], input[id*="label" i], input[placeholder*="label" i]').first();
    this.fileUploadAcceptInput = page.locator('input[name*="accept" i], input[id*="accept" i], select[name*="accept" i], input[placeholder*="accept" i]').first();
    this.fileInput = page.locator('input[type="file"]').first();
    this.uploadButton = page.locator('button:has-text("Upload"), button:has-text("Choose File"), button[type="button"], input[type="file"] + button').first();
    this.uploadStatus = page.locator('[class*="status" i], [class*="Status" i], [class*="upload-status" i], [class*="uploaded" i]').first();
    this.uploadedFileName = page.locator('[class*="filename" i], [class*="file-name" i], text=/.*\\.(pdf|doc|docx|txt)/, [data-filename]').first();

    // Form actions - comprehensive selectors
    this.saveFormButton = page.locator('button:has-text("Save"), button[type="submit"]:has-text("Save"), button[id*="save" i]').first();
    this.submitButton = page.locator('button:has-text("Submit"), button[type="submit"]:has-text("Submit"), button[id*="submit" i]').first();
  }

  /**
   * Fill Form creation form
   */
  async fillFormCreationForm(name, description) {
    logger.info('Waiting for Form creation form to appear...');
    await this.page.waitForTimeout(2000);
    
    // Try to find the name input with multiple selectors
    let nameInputFound = false;
    const nameInputSelectors = [
      this.formNameInput,
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
          logger.info(`Found Form name input using selector ${i + 1}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!nameInputFound || !nameInput) {
      // Take screenshot for debugging
      await this.page.screenshot({ path: 'test-results/form-input-not-found.png', fullPage: true }).catch(() => {});
      throw new Error('Form name input field not found. Form may not have loaded.');
    }
    
    // Update the formNameInput reference for future use
    this.formNameInput = nameInput;
    
    // Clear and fill name field
    await nameInput.clear();
    await this.fillInput(nameInput, name);
    logger.info(`Filled Form name: ${name}`);
    
    if (description) {
      // Try to find description field
      const descInputSelectors = [
        this.formDescriptionInput,
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
        logger.info(`Filled Form description: ${description}`);
      } else {
        logger.warn('Description field not found, skipping description');
      }
    }
  }

  /**
   * Create form
   */
  async createForm() {
    await this.waitForElement(this.createButton);
    await this.clickElement(this.createButton);
    // Use more lenient wait strategy instead of networkidle
    try {
      await this.page.waitForLoadState('load', { timeout: 10000 });
    } catch (error) {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 });
    }
  }

  /**
   * Drag and drop Textbox element onto canvas
   */
  async addTextboxElement() {
    logger.info('Adding Textbox element to canvas via drag and drop');
    
    // Wait for elements menu to be visible
    await this.waitForElement(this.elementsMenu, 10000);
    
    // Find textbox element in the menu
    const textboxSelectors = [
      this.textboxElement,
      this.page.locator('text=Textbox').first(),
      this.page.locator('text=Text Box').first(),
      this.page.locator('[title*="Textbox" i]').first(),
      this.page.locator('[aria-label*="Textbox" i]').first(),
    ];
    
    let textbox = null;
    for (const selector of textboxSelectors) {
      try {
        if (await this.isElementVisible(selector, 3000)) {
          textbox = selector;
          logger.info('Found Textbox element in menu');
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!textbox) {
      throw new Error('Textbox element not found in left menu');
    }
    
    // Find canvas
    const canvasSelectors = [
      this.canvas,
      this.page.locator('[class*="canvas" i]').first(),
      this.page.locator('main').first(),
      this.page.locator('[class*="workspace" i]').first(),
    ];
    
    let canvas = null;
    for (const selector of canvasSelectors) {
      try {
        if (await this.isElementVisible(selector, 3000)) {
          canvas = selector;
          logger.info('Found canvas');
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!canvas) {
      throw new Error('Canvas not found');
    }
    
    // Perform drag and drop
    try {
      // Get bounding boxes for better accuracy
      const textboxBox = await textbox.boundingBox();
      const canvasBox = await canvas.boundingBox();
      
      if (textboxBox && canvasBox) {
        // Click and hold on textbox
        await textbox.click({ button: 'left', delay: 100 });
        await this.page.waitForTimeout(200);
        
        // Move to canvas center
        const canvasCenterX = canvasBox.x + canvasBox.width / 2;
        const canvasCenterY = canvasBox.y + canvasBox.height / 2;
        
        await this.page.mouse.move(canvasCenterX, canvasCenterY);
        await this.page.waitForTimeout(200);
        
        // Release mouse
        await this.page.mouse.up();
        logger.info('Textbox drag and drop completed');
      } else {
        // Fallback: simple drag and drop
        await textbox.hover();
        await this.page.mouse.down();
        await canvas.hover();
        await this.page.mouse.up();
        logger.info('Textbox drag and drop completed (fallback method)');
      }
    } catch (e) {
      logger.warn(`Drag and drop failed: ${e.message}, trying alternative method`);
      // Alternative: try clicking textbox and then clicking on canvas
      try {
        await textbox.click();
        await this.page.waitForTimeout(500);
        await canvas.click();
        logger.info('Textbox added using click method');
      } catch (clickError) {
        throw new Error(`Failed to add Textbox element: ${clickError.message}`);
      }
    }
    
    await this.page.waitForTimeout(2000); // Wait for element to be added to canvas
  }

  /**
   * Drag and drop Select File element onto canvas
   */
  async addSelectFileElement() {
    logger.info('Adding Select File element to canvas via drag and drop');
    
    // Wait for elements menu to be visible
    await this.waitForElement(this.elementsMenu, 10000);
    
    // Find file element in the menu
    const fileSelectors = [
      this.selectFileElement,
      this.page.locator('text=Select File').first(),
      this.page.locator('text=File Upload').first(),
      this.page.locator('text=File').first(),
      this.page.locator('[title*="File" i]').first(),
      this.page.locator('[aria-label*="File" i]').first(),
    ];
    
    let fileElement = null;
    for (const selector of fileSelectors) {
      try {
        if (await this.isElementVisible(selector, 3000)) {
          fileElement = selector;
          logger.info('Found File Upload element in menu');
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!fileElement) {
      throw new Error('File Upload element not found in left menu');
    }
    
    // Find canvas
    const canvasSelectors = [
      this.canvas,
      this.page.locator('[class*="canvas" i]').first(),
      this.page.locator('main').first(),
      this.page.locator('[class*="workspace" i]').first(),
    ];
    
    let canvas = null;
    for (const selector of canvasSelectors) {
      try {
        if (await this.isElementVisible(selector, 3000)) {
          canvas = selector;
          logger.info('Found canvas');
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!canvas) {
      throw new Error('Canvas not found');
    }
    
    // Perform drag and drop
    try {
      // Get bounding boxes for better accuracy
      const fileBox = await fileElement.boundingBox();
      const canvasBox = await canvas.boundingBox();
      
      if (fileBox && canvasBox) {
        // Click and hold on file element
        await fileElement.click({ button: 'left', delay: 100 });
        await this.page.waitForTimeout(200);
        
        // Move to canvas center (offset to avoid overlap with textbox)
        const canvasCenterX = canvasBox.x + canvasBox.width / 2;
        const canvasCenterY = canvasBox.y + canvasBox.height / 2 + 100; // Offset down
        
        await this.page.mouse.move(canvasCenterX, canvasCenterY);
        await this.page.waitForTimeout(200);
        
        // Release mouse
        await this.page.mouse.up();
        logger.info('File Upload drag and drop completed');
      } else {
        // Fallback: simple drag and drop
        await fileElement.hover();
        await this.page.mouse.down();
        await canvas.hover();
        await this.page.mouse.up();
        logger.info('File Upload drag and drop completed (fallback method)');
      }
    } catch (e) {
      logger.warn(`Drag and drop failed: ${e.message}, trying alternative method`);
      // Alternative: try clicking file element and then clicking on canvas
      try {
        await fileElement.click();
        await this.page.waitForTimeout(500);
        await canvas.click();
        logger.info('File Upload added using click method');
      } catch (clickError) {
        throw new Error(`Failed to add File Upload element: ${clickError.message}`);
      }
    }
    
    await this.page.waitForTimeout(2000); // Wait for element to be added to canvas
  }

  /**
   * Click on Textbox element to configure
   */
  async clickTextboxElement() {
    // Try to find textbox on canvas
    const textboxOnCanvas = this.page.locator('[class*="textbox"], [data-type="textbox"], input[type="text"]').first();
    if (await this.isElementVisible(textboxOnCanvas)) {
      await this.clickElement(textboxOnCanvas);
    } else {
      // Fallback: click on the element in the menu
      await this.clickElement(this.textboxElement);
    }
    await this.page.waitForTimeout(500); // Wait for panel to appear
  }

  /**
   * Click on File Upload element to configure
   */
  async clickFileUploadElement() {
    // Try to find file upload on canvas
    const fileOnCanvas = this.page.locator('[class*="file"], [data-type="file"], input[type="file"]').first();
    if (await this.isElementVisible(fileOnCanvas)) {
      await this.clickElement(fileOnCanvas);
    } else {
      // Fallback: click on the element in the menu
      await this.clickElement(this.selectFileElement);
    }
    await this.page.waitForTimeout(500); // Wait for panel to appear
  }

  /**
   * Verify Textbox UI elements in configuration panel
   */
  async verifyTextboxUIElements() {
    return {
      labelInputVisible: await this.isElementVisible(this.textboxLabelInput),
      placeholderInputVisible: await this.isElementVisible(this.textboxPlaceholderInput),
      requiredCheckboxVisible: await this.isElementVisible(this.textboxRequiredCheckbox),
      valueInputVisible: await this.isElementVisible(this.textboxValueInput)
    };
  }

  /**
   * Verify File Upload UI elements in configuration panel
   */
  async verifyFileUploadUIElements() {
    return {
      labelInputVisible: await this.isElementVisible(this.fileUploadLabelInput),
      acceptInputVisible: await this.isElementVisible(this.fileUploadAcceptInput),
      fileInputVisible: await this.isElementVisible(this.fileInput),
      uploadButtonVisible: await this.isElementVisible(this.uploadButton)
    };
  }

  /**
   * Enter text in textbox
   */
  async enterTextInTextbox(text) {
    await this.clickTextboxElement();
    if (await this.isElementVisible(this.textboxValueInput)) {
      await this.fillInput(this.textboxValueInput, text);
    }
  }

  /**
   * Upload file
   */
  async uploadFile(filePath) {
    await this.clickFileUploadElement();
    
    // Try multiple strategies to upload file
    if (await this.isElementVisible(this.fileInput)) {
      try {
        await this.fileInput.setInputFiles(filePath);
        await this.page.waitForTimeout(2000); // Wait for upload to process
        logger.info('File uploaded via file input');
      } catch (error) {
        logger.warn(`File upload via input failed: ${error.message}`);
      }
    } else if (await this.isElementVisible(this.uploadButton)) {
      try {
        await this.clickElement(this.uploadButton);
        // Handle file dialog if it appears
        const fileDialog = await this.page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null);
        if (fileDialog) {
          await fileDialog.setFiles(filePath);
          await this.page.waitForTimeout(2000); // Wait for upload to process
          logger.info('File uploaded via file dialog');
        }
      } catch (error) {
        logger.warn(`File upload via button failed: ${error.message}`);
      }
    } else {
      // Try to find any file input on the page
      const anyFileInput = this.page.locator('input[type="file"]').first();
      if (await this.isElementVisible(anyFileInput)) {
        try {
          await anyFileInput.setInputFiles(filePath);
          await this.page.waitForTimeout(2000);
          logger.info('File uploaded via fallback file input');
        } catch (error) {
          logger.warn(`File upload via fallback failed: ${error.message}`);
        }
      }
    }
  }

  /**
   * Verify file upload status
   */
  async verifyFileUploaded() {
    // Check for upload status indicators
    const statusIndicators = [
      this.uploadStatus,
      this.uploadedFileName,
      this.page.locator('text=/uploaded|success|complete/i'),
      this.page.locator('[class*="success"], [class*="complete"]')
    ];

    for (const indicator of statusIndicators) {
      if (await this.isElementVisible(indicator)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get uploaded file name
   */
  async getUploadedFileName() {
    if (await this.isElementVisible(this.uploadedFileName)) {
      return await this.getText(this.uploadedFileName);
    }
    return '';
  }

  /**
   * Save form
   */
  async saveForm() {
    await this.waitForElement(this.saveFormButton);
    await this.clickElement(this.saveFormButton);
    // Use more lenient wait strategy instead of networkidle
    try {
      await this.page.waitForLoadState('load', { timeout: 10000 });
    } catch (error) {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 });
    }
  }

  /**
   * Check if form was saved successfully
   */
  async isFormSaved() {
    return await this.isElementVisible(this.successMessage);
  }
}

module.exports = { FormPage };

