// State management - replacing React useState
let appState = {
  image: null,
  analysis: null,
  selectedSize: null,
  selectedGrade: null,
  selectedExplanation: null,
  backgroundColor: '',
  customSizes: [],
  fittingMode: 'fit', // 'fit' or 'fill'
  imageSizePercent: 100 // Percentage of image size relative to frame (50-200, can exceed frame)
};

// Debounce timer for custom size input
let customSizeDebounceTimer = null;

// Track which fields were auto-calculated vs manually entered
let customSizeFieldStates = {
  width: { value: '', manuallyEntered: false },
  height: { value: '', manuallyEntered: false },
  ratio: { value: '', manuallyEntered: false }
};

// DOM element references
const elements = {
  calcContainer: document.querySelector('.calc-container'),
  imageTitleHeader: document.getElementById('image-title-header'),
  summaryText: document.getElementById('summary-text'),
  uploadedImage: document.getElementById('uploaded-image'),
  imageAnalysis: document.getElementById('image-analysis'),
  qualityCanvas: document.getElementById('quality-canvas'),
  previewFrame: document.getElementById('preview-frame'),
  fittingControls: document.getElementById('fitting-controls'),
  sizeGrid: document.getElementById('size-grid'),
  sizeDetails: document.getElementById('size-details'),
  selectedSize: document.getElementById('selected-size'),
  selectedGrade: document.getElementById('selected-grade'),
  selectedDpi: document.getElementById('selected-dpi'),
  selectedExplanation: document.getElementById('selected-explanation'),
  uploadButton: document.querySelector('.upload-button'),
  urlButton: document.querySelector('.url-button'),
  urlForm: document.querySelector('.url-form'),
  urlInput: document.querySelector('.url-input'),
  urlSubmit: document.querySelector('.submit-button'),
  customSizeForm: document.querySelector('.custom-size-form'),
  customSizeInputs: document.querySelectorAll('.custom-size-form input'),
  unitToggle: document.querySelector('.unit-toggle'),
  cancelButton: document.querySelector('.cancel-button'),
  fileInput: document.querySelector('.hidden-input')
};

// Common sizes data - ordered by pixel area (width * height)
const COMMON_SIZES = [
  { name: 'A6', width: 4.1, height: 5.8, unit: '', description: 'Postcard size' },
  { name: '4x6', width: 4, height: 6, unit: 'in', description: 'Common photo size for albums' },
  { name: '5x7', width: 5, height: 7, unit: 'in', description: 'Common photo size for frames' },
  { name: 'A5', width: 5.8, height: 8.3, unit: '', description: 'Half of A4, used for notebooks' },
  { name: '8x10', width: 8, height: 10, unit: 'in', description: 'Standard photo size for portraits' },
  { name: 'A4', width: 8.3, height: 11.7, unit: '', description: 'Standard letter size paper' },
  { name: '10x15', width: 10, height: 15, unit: 'cm', description: 'Common photo size' },
  { name: '11x14', width: 11, height: 14, unit: 'in', description: 'Common print size for photos' },
  { name: 'A3', width: 11.7, height: 16.5, unit: '', description: 'Used for posters and drawings' },
  { name: '12x18', width: 12, height: 18, unit: 'in', description: 'Common poster size' },
  { name: '13x18', width: 13, height: 18, unit: 'cm', description: 'Common photo size' },
  { name: '15x20', width: 15, height: 20, unit: 'cm', description: 'Common photo size' },
  { name: '16x20', width: 16, height: 20, unit: 'in', description: 'Common size for wall art' },
  { name: '16x24', width: 16, height: 24, unit: 'in', description: 'Common poster size' },
  { name: 'A2', width: 16.5, height: 23.4, unit: '', description: 'Used for large posters' },
  { name: '18x24', width: 18, height: 24, unit: 'in', description: 'Used for movie posters' },
  { name: '20x25', width: 20, height: 25, unit: 'cm', description: 'Common poster size' },
  { name: '20x30', width: 20, height: 30, unit: 'cm', description: 'Common poster size' },
  { name: '24x30', width: 24, height: 30, unit: 'in', description: 'Common print size for art' },
  { name: 'A1', width: 23.4, height: 33.1, unit: '', description: 'Used for large prints and posters' },
  { name: '24x36', width: 24, height: 36, unit: 'in', description: 'Standard movie poster size' },
  { name: '30x40', width: 30, height: 40, unit: 'cm', description: 'Common poster size' },
  { name: 'A0', width: 33.1, height: 46.8, unit: '', description: 'Used for large format prints' },
  { name: '36x48', width: 36, height: 48, unit: 'in', description: 'Large poster size' },
  { name: '30x60', width: 30, height: 60, unit: 'in', description: 'Common banner size' },
  { name: '48x72', width: 48, height: 72, unit: 'in', description: 'Extra large poster size' },
  { name: '50x70', width: 50, height: 70, unit: 'cm', description: 'Large poster size' },
  { name: '70x100', width: 70, height: 100, unit: 'cm', description: 'Extra large poster/banner' }
];

// Utility functions
function getGradeColor(dpi) {
  if (dpi > 300) return '#10B981'; // Green - Excellent
  if (dpi >= 200) return '#F59E0B'; // Yellow - Good
  if (dpi >= 150) return '#F97316'; // Orange - Fair
  return '#EF4444'; // Red - Poor
}

function getGradeText(dpi) {
  if (dpi > 300) return 'Excellent';
  if (dpi >= 200) return 'Good';
  if (dpi >= 150) return 'Fair';
  return 'Poor';
}

function getGradeExplanation(dpi) {
  if (dpi >= 300) return 'The image resolution is perfect for this size.';
  if (dpi >= 200) return 'The image should print well at this size.';
  if (dpi >= 150) return 'The image may appear slightly pixelated at this size.';
  return 'The image resolution is too low for this size. It will appear pixelated.';
}

// Initialize the application
function init() {
  setupEventListeners();
  // Google Analytics is already initialized in the HTML
}

// Set up all event listeners
function setupEventListeners() {
  // File upload
  elements.fileInput.addEventListener('change', handleFileUpload);

  // Upload button click (triggers file input)
  elements.uploadButton.addEventListener('click', () => {
    elements.fileInput.click();
  });

  // URL input toggle
  elements.urlButton.addEventListener('click', toggleUrlInput);

  // URL form submission
  elements.urlForm.addEventListener('submit', handleUrlSubmit);

  // Custom size button removed - now using + button in grid

  // Custom size form
  elements.customSizeForm.addEventListener('submit', handleCustomSizeSubmit);
  elements.cancelButton.addEventListener('click', hideCustomSizeForm);

  // Unit toggle
  elements.unitToggle.addEventListener('click', toggleUnit);

  // Drag and drop
  document.addEventListener('drop', handleDrop);
  document.addEventListener('dragover', handleDragOver);

  // Custom size input fields with auto-calculation
  document.querySelectorAll('.width-field, .height-field, .ratio-field').forEach(input => {
    input.addEventListener('input', (e) => {
      const fieldName = e.target.classList.contains('width-field') ? 'width' :
                       e.target.classList.contains('height-field') ? 'height' : 'ratio';

      // If field is being cleared (empty value), reset its manually entered state
      if (!e.target.value.trim()) {
        customSizeFieldStates[fieldName].manuallyEntered = false;
      } else {
        // Field has content, mark as manually entered
        customSizeFieldStates[fieldName].manuallyEntered = true;
      }

      handleCustomSizeInput();
    });
  });

  // Input validation for numeric fields only (width and height)
  document.querySelectorAll('.width-field, .height-field').forEach(input => {
    input.addEventListener('input', validateNumericInput);
  });

  // Fitting mode buttons (exclude +/- buttons which don't have data-mode)
  document.querySelectorAll('.fitting-button[data-mode]').forEach(button => {
    button.addEventListener('click', (e) => {
      const mode = e.target.getAttribute('data-mode');
      if (mode) {
        setFittingMode(mode);
      }
    });
  });

  // Image size adjustment buttons
  const decreaseImageSizeBtn = document.getElementById('decrease-image-size');
  const increaseImageSizeBtn = document.getElementById('increase-image-size');
  
  if (decreaseImageSizeBtn) {
    decreaseImageSizeBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent any other handlers
      adjustImageSize(-5); // Decrease by 5%
    });
  }
  
  if (increaseImageSizeBtn) {
    increaseImageSizeBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent any other handlers
      adjustImageSize(5); // Increase by 5%
    });
  }
}

// File upload handler
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    processImageFile(file);
  }
}

// Process uploaded image file
function processImageFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const imageData = {
        file: file,
        width: img.width,
        height: img.height,
        src: e.target.result
      };
      handleImageUpload(imageData);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Handle image upload (similar to React handleImageUpload)
function handleImageUpload(imageData) {
  appState.image = imageData;

  // Update image display
  elements.uploadedImage.src = imageData.src;
  elements.imageTitleHeader.textContent = 'Print Summary';

  // Show DPI preview when image loads
  elements.uploadedImage.onload = () => {
    updateDpiPreview(300, null); // Start with perfect quality
  };

  // Update image analysis
  updateImageAnalysis();

  // Analyze image
  analyzeImage(imageData.width, imageData.height);

  // Show calculator
  elements.calcContainer.classList.remove('hidden');

  // Track with Google Analytics
  gtag('event', 'Image Upload', {
    category: 'User Interaction',
    action: 'Image Upload',
    label: imageData.file.name
  });
}

// Analyze image for all sizes
function analyzeImage(width, height, sizes = [...COMMON_SIZES, ...appState.customSizes]) {
  const results = sizes.map(size => {
    const dpi = Math.min(width / size.width, height / size.height);
    const grade = getGradeText(dpi);
    const explanation = getGradeExplanation(dpi);

    return {
      size: size.name,
      grade,
      explanation,
      dpi: Math.round(dpi)
    };
  });

  appState.analysis = results;
  renderSizeOptions();
}

// Render size options
function renderSizeOptions() {
  elements.sizeGrid.innerHTML = '';

  appState.analysis.forEach((result, index) => {
    const sizeInfo = [...COMMON_SIZES, ...appState.customSizes].find(size => size.name === result.size);
    const isCustomSize = appState.customSizes.some(size => size.name === result.size);

    const button = document.createElement('button');
    button.className = `size-option ${appState.selectedSize === result.size ? 'selected' : ''}`;
    button.style.backgroundColor = getGradeColor(result.dpi);
    button.setAttribute('data-unit', sizeInfo?.unit || '');
    button.title = sizeInfo?.description || '';

    // Create button content
    const buttonContent = document.createElement('span');
    buttonContent.textContent = result.size;
    button.appendChild(buttonContent);

    // Add delete button for custom sizes
    if (isCustomSize) {
      const deleteButton = document.createElement('span');
      deleteButton.className = 'delete-custom-size';
      deleteButton.textContent = '×';
      deleteButton.title = 'Remove custom size';
      deleteButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering size selection
        removeCustomSize(result.size);
      });
      button.appendChild(deleteButton);
    }

    button.addEventListener('click', () => selectSize(result, sizeInfo));

    elements.sizeGrid.appendChild(button);
  });

  // Add the "+" button for custom sizes
  const addButton = document.createElement('button');
  addButton.className = 'size-option add-custom-size';
  addButton.textContent = '+';
  addButton.title = 'Add custom size';
  addButton.style.backgroundColor = '#6B7280'; // Gray color for add button
  addButton.addEventListener('click', () => toggleCustomSizeForm());

  elements.sizeGrid.appendChild(addButton);
}

// Calculate DPI based on printed image size
function calculateDpiFromPrintedSize(sizeInfo) {
  if (!appState.image || !sizeInfo) return null;
  
  const img = appState.image;
  const imgWidth = img.width;
  const imgHeight = img.height;
  const imageAspectRatio = imgWidth / imgHeight;
  
  // Determine if orientations match
  const isImageLandscape = imageAspectRatio > 1;
  const frameAspectRatio = sizeInfo.width / sizeInfo.height;
  const isFrameLandscape = frameAspectRatio > 1;
  
  // Always use original frame dimensions (not swapped) for display
  const frameWidth = sizeInfo.width;
  const frameHeight = sizeInfo.height;
  
  // Account for image size percentage
  const imageSizePercent = appState.imageSizePercent || 100;
  const imageSizeFactor = imageSizePercent / 100;
  
  // For fill mode, we need to consider orientation matching
  let effectiveFrameWidth, effectiveFrameHeight;
  
  if (appState.fittingMode === 'fill' && isImageLandscape !== isFrameLandscape) {
    // In fill mode with mismatched orientations, swap the frame dimensions
    effectiveFrameWidth = frameHeight * imageSizeFactor;
    effectiveFrameHeight = frameWidth * imageSizeFactor;
  } else {
    effectiveFrameWidth = frameWidth * imageSizeFactor;
    effectiveFrameHeight = frameHeight * imageSizeFactor;
  }
  
  let printedImageWidth, printedImageHeight;
  
  if (appState.fittingMode === 'fill') {
    // Fill mode: printed image size equals effective frame size
    printedImageWidth = effectiveFrameWidth;
    printedImageHeight = effectiveFrameHeight;
  } else {
    // Fit mode: calculate actual printed image size to fit within effective frame
    let effectiveWidth = effectiveFrameWidth;
    let effectiveHeight = effectiveFrameHeight;
    
    if (isImageLandscape !== isFrameLandscape) {
      // Swap frame dimensions to match image orientation for fitting calculations
      effectiveWidth = effectiveFrameHeight;
      effectiveHeight = effectiveFrameWidth;
    }
    
    // Calculate printed size based on effective frame
    if (imageAspectRatio > effectiveWidth / effectiveHeight) {
      // Image is wider - fit to effective frame width
      const calculatedWidth = effectiveWidth;
      const calculatedHeight = effectiveWidth / imageAspectRatio;
      // Convert back to original frame orientation
      if (isImageLandscape !== isFrameLandscape) {
        printedImageWidth = calculatedHeight;
        printedImageHeight = calculatedWidth;
      } else {
        printedImageWidth = calculatedWidth;
        printedImageHeight = calculatedHeight;
      }
    } else {
      // Image is taller - fit to effective frame height
      const calculatedHeight = effectiveHeight;
      const calculatedWidth = effectiveHeight * imageAspectRatio;
      // Convert back to original frame orientation
      if (isImageLandscape !== isFrameLandscape) {
        printedImageWidth = calculatedHeight;
        printedImageHeight = calculatedWidth;
      } else {
        printedImageWidth = calculatedWidth;
        printedImageHeight = calculatedHeight;
      }
    }
  }
  
  // Calculate DPI based on printed image size
  return Math.min(imgWidth / printedImageWidth, imgHeight / printedImageHeight);
}

// Helper function to create measurement text with info icon for single dimension
function createMeasurementWithInfo(inches, cm, label = '') {
  const tooltipText = `${inches.toFixed(2)} inches (${cm} cm)`;
  return `<span class="measurement-with-tooltip" data-tooltip="${tooltipText}" title="${tooltipText}">${inches.toFixed(2)}"</span>${label ? ' ' + label : ''}`;
}

// Helper function to create measurement text with info icon for two dimensions
function createMeasurementWithInfo2D(widthInches, heightInches, widthCm, heightCm, label = '') {
  const tooltipText = `${widthInches.toFixed(2)} × ${heightInches.toFixed(2)} inches (${widthCm} × ${heightCm} cm)`;
  return `<span class="measurement-with-tooltip" data-tooltip="${tooltipText}" title="${tooltipText}">${widthInches.toFixed(2)}" × ${heightInches.toFixed(2)}"</span>${label ? ' ' + label : ''}`;
}

// Update summary text in header
function updateSummary() {
  if (!appState.image || !elements.summaryText) return;

  const { width: imgWidth, height: imgHeight } = appState.image;

  if (appState.selectedSize) {
    const selectedResult = appState.analysis.find(r => r.size === appState.selectedSize);
    if (selectedResult) {
      const sizeInfo = [...COMMON_SIZES, ...appState.customSizes].find(size => size.name === appState.selectedSize);
      if (!sizeInfo) return;

      // Format frame size display
      const frameWidth = sizeInfo.width;
      const frameHeight = sizeInfo.height;
      const frameCmWidth = Math.round(frameWidth * 2.54 * 100) / 100;
      const frameCmHeight = Math.round(frameHeight * 2.54 * 100) / 100;
      const frameDisplay = createMeasurementWithInfo2D(frameWidth, frameHeight, frameCmWidth, frameCmHeight);

      // Calculate printed image size and coverage
      const imageAspectRatio = imgWidth / imgHeight;
      const isImageLandscape = imageAspectRatio > 1;
      const frameAspectRatio = frameWidth / frameHeight;
      const isFrameLandscape = frameAspectRatio > 1;
      
      const imageSizePercent = appState.imageSizePercent || 100;
      const imageSizeFactor = imageSizePercent / 100;
      
      let effectiveFrameWidth, effectiveFrameHeight;
      if (appState.fittingMode === 'fill' && isImageLandscape !== isFrameLandscape) {
        effectiveFrameWidth = frameHeight * imageSizeFactor;
        effectiveFrameHeight = frameWidth * imageSizeFactor;
      } else {
        effectiveFrameWidth = frameWidth * imageSizeFactor;
        effectiveFrameHeight = frameHeight * imageSizeFactor;
      }
      
      let printedImageWidth, printedImageHeight;
      let frameCoveragePercentage, imageCoveragePercentage;
      let marginsInfo = '';
      let hiddenImageInfo = '';
      
      if (appState.fittingMode === 'fill') {
        printedImageWidth = effectiveFrameWidth;
        printedImageHeight = effectiveFrameHeight;
        
        frameCoveragePercentage = Math.min(100, Math.round((imageSizeFactor * imageSizeFactor) * 100));
        
        // In fill mode, calculate what part of image is cropped (not visible)
        // The image is scaled to fill the frame, so parts extend beyond
        const scaleX = effectiveFrameWidth / imgWidth;
        const scaleY = effectiveFrameHeight / imgHeight;
        const fillScale = Math.max(scaleX, scaleY);
        
        const scaledImageWidth = imgWidth * fillScale;
        const scaledImageHeight = imgHeight * fillScale;
        
        // Calculate cropped dimensions (parts that extend beyond frame)
        const croppedWidth = Math.max(0, scaledImageWidth - effectiveFrameWidth);
        const croppedHeight = Math.max(0, scaledImageHeight - effectiveFrameHeight);
        const croppedWidthInches = croppedWidth / fillScale;
        const croppedHeightInches = croppedHeight / fillScale;
        const croppedWidthCm = Math.round((croppedWidthInches * 2.54) * 100) / 100;
        const croppedHeightCm = Math.round((croppedHeightInches * 2.54) * 100) / 100;
        
        // Calculate image coverage first
        const visibleImageWidth = Math.min(scaledImageWidth, effectiveFrameWidth);
        const visibleImageHeight = Math.min(scaledImageHeight, effectiveFrameHeight);
        const visibleImageArea = visibleImageWidth * visibleImageHeight;
        const totalImageArea = imgWidth * imgHeight;
        imageCoveragePercentage = Math.round((visibleImageArea / totalImageArea) * 100);
        
        // Calculate cropped percentage for fill mode
        if (imageCoveragePercentage < 100) {
          hiddenImageInfo = `${100 - imageCoveragePercentage}%`;
        } else {
          hiddenImageInfo = '';
        }
        
        // In fill mode, margins only exist if image size was reduced (using - button)
        const marginWidth = Math.max(0, (frameWidth - printedImageWidth) / 2);
        const marginHeight = Math.max(0, (frameHeight - printedImageHeight) / 2);
        const marginWidthCm = Math.round(marginWidth * 2.54 * 100) / 100;
        const marginHeightCm = Math.round(marginHeight * 2.54 * 100) / 100;
        
        // Store margin values separately for formatting
        marginWidthValue = marginWidth > 0.01 ? marginWidth : 0;
        marginHeightValue = marginHeight > 0.01 ? marginHeight : 0;
        marginWidthCmValue = marginWidth > 0.01 ? marginWidthCm : 0;
        marginHeightCmValue = marginHeight > 0.01 ? marginHeightCm : 0;
        
        marginsInfo = (marginWidthValue > 0 || marginHeightValue > 0) ? 'has_margins' : '';
      } else {
        // Fit mode
        let effectiveWidth = effectiveFrameWidth;
        let effectiveHeight = effectiveFrameHeight;
        
        if (isImageLandscape !== isFrameLandscape) {
          effectiveWidth = effectiveFrameHeight;
          effectiveHeight = effectiveFrameWidth;
        }
        
        if (imageAspectRatio > effectiveWidth / effectiveHeight) {
          const calculatedWidth = effectiveWidth;
          const calculatedHeight = effectiveWidth / imageAspectRatio;
          if (isImageLandscape !== isFrameLandscape) {
            printedImageWidth = calculatedHeight;
            printedImageHeight = calculatedWidth;
          } else {
            printedImageWidth = calculatedWidth;
            printedImageHeight = calculatedHeight;
          }
        } else {
          const calculatedHeight = effectiveHeight;
          const calculatedWidth = effectiveHeight * imageAspectRatio;
          if (isImageLandscape !== isFrameLandscape) {
            printedImageWidth = calculatedHeight;
            printedImageHeight = calculatedWidth;
          } else {
            printedImageWidth = calculatedWidth;
            printedImageHeight = calculatedHeight;
          }
        }
        
        const frameArea = frameWidth * frameHeight;
        const printedImageArea = printedImageWidth * printedImageHeight;
        frameCoveragePercentage = Math.min(100, Math.round((printedImageArea / frameArea) * 100));
        
        // In fit mode: calculate margins (space between frame and image edges)
        const marginWidth = (frameWidth - printedImageWidth) / 2;
        const marginHeight = (frameHeight - printedImageHeight) / 2;
        const marginWidthCm = Math.round(marginWidth * 2.54 * 100) / 100;
        const marginHeightCm = Math.round(marginHeight * 2.54 * 100) / 100;
        
        // Store margin values separately for formatting
        marginWidthValue = marginWidth > 0.01 ? marginWidth : 0;
        marginHeightValue = marginHeight > 0.01 ? marginHeight : 0;
        marginWidthCmValue = marginWidth > 0.01 ? marginWidthCm : 0;
        marginHeightCmValue = marginHeight > 0.01 ? marginHeightCm : 0;
        
        marginsInfo = (marginWidthValue > 0 || marginHeightValue > 0) ? 'has_margins' : '';
        
        // In fit mode, entire image is visible, nothing is cropped
        hiddenImageInfo = '';
        imageCoveragePercentage = 100;
      }
      
      // Format printed image size
      const printedCmWidth = Math.round(printedImageWidth * 2.54 * 100) / 100;
      const printedCmHeight = Math.round(printedImageHeight * 2.54 * 100) / 100;
      
      // Calculate DPI
      const calculatedDpi = Math.min(imgWidth / printedImageWidth, imgHeight / printedImageHeight);
      const roundedDpi = Math.round(calculatedDpi);
      const calculatedGrade = getGradeText(calculatedDpi);
      
      // Build natural flowing text - start with quality
      const qualityText = calculatedGrade.charAt(0).toUpperCase() + calculatedGrade.slice(1).toLowerCase();
      let summaryText = `At selected size ${appState.selectedSize} the quality of the print will be <strong>${qualityText}</strong> at ${roundedDpi} DPI. `;
      
      summaryText += `The frame measures ${frameDisplay}. `;
      summaryText += `In these measurements, print your image at ${createMeasurementWithInfo2D(printedImageWidth, printedImageHeight, printedCmWidth, printedCmHeight)}. `;
      
      if (appState.fittingMode === 'fit') {
        // Check if both margins are 0
        if (marginWidthValue === 0 && marginHeightValue === 0) {
          summaryText += `The image will fit perfectly in the frame. `;
        } else {
          // Build margin text only for non-zero margins
          const marginParts = [];
          if (marginHeightValue > 0) {
            marginParts.push(`The vertical margins will be ${createMeasurementWithInfo(marginHeightValue, marginHeightCmValue)}`);
          }
          if (marginWidthValue > 0) {
            marginParts.push(`The horizontal margins will be ${createMeasurementWithInfo(marginWidthValue, marginWidthCmValue)}`);
          }
          if (marginParts.length > 0) {
            summaryText += marginParts.join(' and ') + '. ';
          }
        }
      } else {
        if (hiddenImageInfo) {
          summaryText += `Approximately ${hiddenImageInfo} of the image will be cropped and not visible. `;
        } else {
          summaryText += `The entire image will be visible. `;
        }
        
        // Check if both margins are 0
        if (marginWidthValue === 0 && marginHeightValue === 0) {
          summaryText += `The image will fit perfectly in the frame. `;
        } else {
          // Build margin text only for non-zero margins
          const marginParts = [];
          if (marginHeightValue > 0) {
            marginParts.push(`The vertical margins will be ${createMeasurementWithInfo(marginHeightValue, marginHeightCmValue)}`);
          }
          if (marginWidthValue > 0) {
            marginParts.push(`The horizontal margins will be ${createMeasurementWithInfo(marginWidthValue, marginWidthCmValue)}`);
          }
          if (marginParts.length > 0) {
            summaryText += marginParts.join(' and ') + '. ';
          }
        }
      }
      
      elements.summaryText.innerHTML = `<p>${summaryText}</p>`;
    }
  } else {
    // Show maximum frame size and instruction when no frame is selected
    const maxWidthInches = Math.round((imgWidth / 300) * 100) / 100;
    const maxHeightInches = Math.round((imgHeight / 300) * 100) / 100;
    const maxWidthCm = Math.round((maxWidthInches * 2.54) * 100) / 100;
    const maxHeightCm = Math.round((maxHeightInches * 2.54) * 100) / 100;

    const maxSizeDisplay = createMeasurementWithInfo2D(maxWidthInches, maxHeightInches, maxWidthCm, maxHeightCm);
    
    elements.summaryText.innerHTML = `
      <p>For optimal quality (300 DPI), your image can be printed up to <strong>${maxSizeDisplay}</strong>.</p>
      <p>Select a frame size from the options on the right to calculate the actual print quality for that specific size.</p>
    `;
  }
}

// Update image analysis display
function updateImageAnalysis() {
  if (!appState.image) return;

  const { width: imgWidth, height: imgHeight } = appState.image;

  if (appState.selectedSize) {
    // Show selected size detailed analysis
    const selectedResult = appState.analysis.find(r => r.size === appState.selectedSize);
    if (selectedResult) {
      // Get size dimensions
      const sizeInfo = [...COMMON_SIZES, ...appState.customSizes].find(size => size.name === appState.selectedSize);
      let sizeDisplay = appState.selectedSize;

      if (sizeInfo && sizeInfo.width && sizeInfo.height) {
        // Always show both inch and cm measurements
        const inchWidth = sizeInfo.width;
        const inchHeight = sizeInfo.height;
        const cmWidth = Math.round(sizeInfo.width * 2.54 * 100) / 100;
        const cmHeight = Math.round(sizeInfo.height * 2.54 * 100) / 100;

        sizeDisplay = `${inchWidth} × ${inchHeight} in / ${cmWidth} × ${cmHeight} cm`;
      }

      // Calculate printed image size based on fitting mode
      let printedImageWidth, printedImageHeight;
      let frameCoveragePercentage;
      let imageCoveragePercentage;
      
      if (appState.image && sizeInfo) {
        const img = appState.image;
        const imgWidth = img.width;
        const imgHeight = img.height;
        const imageAspectRatio = imgWidth / imgHeight;
        
        // Determine if orientations match (same logic as in updatePreviewFrame)
        const isImageLandscape = imageAspectRatio > 1;
        const frameAspectRatio = sizeInfo.width / sizeInfo.height;
        const isFrameLandscape = frameAspectRatio > 1;
        
        // Always use original frame dimensions (not swapped) for display
        const frameWidth = sizeInfo.width;
        const frameHeight = sizeInfo.height;
        
        // Account for image size percentage
        const imageSizePercent = appState.imageSizePercent || 100;
        const imageSizeFactor = imageSizePercent / 100;
        
        // For fill mode, we need to consider orientation matching
        let effectiveFrameWidth, effectiveFrameHeight;
        
        if (appState.fittingMode === 'fill' && isImageLandscape !== isFrameLandscape) {
          // In fill mode with mismatched orientations, swap the frame dimensions
          effectiveFrameWidth = frameHeight * imageSizeFactor;
          effectiveFrameHeight = frameWidth * imageSizeFactor;
        } else {
          effectiveFrameWidth = frameWidth * imageSizeFactor;
          effectiveFrameHeight = frameHeight * imageSizeFactor;
        }
        
        if (appState.fittingMode === 'fill') {
          // Fill mode: printed image size equals effective frame size (based on image size percentage)
          printedImageWidth = effectiveFrameWidth;
          printedImageHeight = effectiveFrameHeight;
          
          // Frame coverage: % of frame covered by printed image (capped at 100%)
          frameCoveragePercentage = Math.min(100, Math.round((imageSizeFactor * imageSizeFactor) * 100));
          
          // Image coverage: % of image that is visible within the original frame
          // Calculate what portion of the printed image fits within the original frame bounds
          const visibleImageWidth = Math.min(printedImageWidth, frameWidth);
          const visibleImageHeight = Math.min(printedImageHeight, frameHeight);
          const visibleImageArea = visibleImageWidth * visibleImageHeight;
          
          // Total printed image area
          const totalImageArea = printedImageWidth * printedImageHeight;
          
          // Image coverage = visible image area / total image area
          imageCoveragePercentage = Math.round((visibleImageArea / totalImageArea) * 100);
        } else {
          // Fit mode: calculate actual printed image size to fit within effective frame
          // Use effective frame dimensions for calculation (swapped if orientations don't match)
          let effectiveWidth = effectiveFrameWidth;
          let effectiveHeight = effectiveFrameHeight;
          
          if (isImageLandscape !== isFrameLandscape) {
            // Swap frame dimensions to match image orientation for fitting calculations
            effectiveWidth = effectiveFrameHeight;
            effectiveHeight = effectiveFrameWidth;
          }
          
          // Calculate printed size based on effective frame
          if (imageAspectRatio > effectiveWidth / effectiveHeight) {
            // Image is wider - fit to effective frame width
            const calculatedWidth = effectiveWidth;
            const calculatedHeight = effectiveWidth / imageAspectRatio;
            // Convert back to original frame orientation
            if (isImageLandscape !== isFrameLandscape) {
              printedImageWidth = calculatedHeight;
              printedImageHeight = calculatedWidth;
            } else {
              printedImageWidth = calculatedWidth;
              printedImageHeight = calculatedHeight;
            }
          } else {
            // Image is taller - fit to effective frame height
            const calculatedHeight = effectiveHeight;
            const calculatedWidth = effectiveHeight * imageAspectRatio;
            // Convert back to original frame orientation
            if (isImageLandscape !== isFrameLandscape) {
              printedImageWidth = calculatedHeight;
              printedImageHeight = calculatedWidth;
            } else {
              printedImageWidth = calculatedWidth;
              printedImageHeight = calculatedHeight;
            }
          }
          
          // Frame coverage: % of frame covered by printed image (capped at 100%)
          const frameArea = frameWidth * frameHeight;
          const printedImageArea = printedImageWidth * printedImageHeight;
          frameCoveragePercentage = Math.min(100, Math.round((printedImageArea / frameArea) * 100));
          
          // Image coverage: % of image that is visible within the original frame
          // Calculate what portion of the printed image fits within the original frame bounds
          const visibleImageWidth = Math.min(printedImageWidth, frameWidth);
          const visibleImageHeight = Math.min(printedImageHeight, frameHeight);
          const visibleImageArea = visibleImageWidth * visibleImageHeight;
          
          // Total printed image area
          const totalImageArea = printedImageWidth * printedImageHeight;
          
          // Image coverage = visible image area / total image area
          imageCoveragePercentage = Math.round((visibleImageArea / totalImageArea) * 100);
        }
        
        // Format printed image size display (always in original frame orientation)
        const printedCmWidth = Math.round(printedImageWidth * 2.54 * 100) / 100;
        const printedCmHeight = Math.round(printedImageHeight * 2.54 * 100) / 100;
        const printedImageDisplay = `${printedImageWidth} × ${printedImageHeight} in / ${printedCmWidth} × ${printedCmHeight} cm`;
        
        // Calculate DPI based on printed image size (not frame size)
        const calculatedDpi = Math.min(imgWidth / printedImageWidth, imgHeight / printedImageHeight);
        const roundedDpi = Math.round(calculatedDpi);
        const calculatedGrade = getGradeText(calculatedDpi);
        const calculatedExplanation = getGradeExplanation(calculatedDpi);
        
        elements.imageAnalysis.innerHTML = `
          <div class="analysis-text">
            <div class="analysis-summary">
              <strong>Original Image Size:</strong> ${imgWidth} × ${imgHeight} pixels<br>
              <strong>Frame Size:</strong> ${sizeDisplay}<br>
              <strong>Printed Image Size:</strong> ${printedImageDisplay}<br>
              <strong>Frame Coverage:</strong> ${frameCoveragePercentage}%<br>
              <strong>Image Coverage:</strong> ${imageCoveragePercentage}%<br>
              <strong>Quality:</strong> ${calculatedGrade} (${roundedDpi} DPI)<br>
              <strong>Details:</strong> ${calculatedExplanation}
            </div>
          </div>
        `;
        
        // Update DPI quality preview with calculated DPI based on printed image size
        updateDpiPreview(calculatedDpi, sizeInfo);
      } else {
        elements.imageAnalysis.innerHTML = `
          <div class="analysis-text">
            <div class="analysis-summary">
              <strong>Frame Size:</strong> ${sizeDisplay}<br>
              <strong>Quality:</strong> ${selectedResult.grade} (${selectedResult.dpi} DPI)<br>
              <strong>Details:</strong> ${selectedResult.explanation}
            </div>
          </div>
        `;
        
        // Update DPI quality preview with original DPI
        updateDpiPreview(selectedResult.dpi, sizeInfo);
      }
    }
  } else {
    // Clear analysis display when no frame is selected (summary shows max size info)
    elements.imageAnalysis.innerHTML = '';

    // Hide fitting controls when no size is selected
    elements.fittingControls.classList.add('hidden');

    // Show perfect quality preview when no size selected
    updateDpiPreview(300, null);
  }

  // Update summary text
  updateSummary();
}

// Update DPI quality preview on canvas
function updateDpiPreview(dpi, sizeInfo) {
  const canvas = elements.qualityCanvas;
  const ctx = canvas.getContext('2d');
  const img = elements.uploadedImage;
  const frame = elements.previewFrame;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!img.complete || img.naturalWidth === 0) {
    // Image not loaded yet - show loading state
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Upload an image to see DPI preview', canvas.width / 2, canvas.height / 2);
    canvas.style.display = 'block';
    frame.classList.add('hidden');
    return;
  }

  // Canvas is always visible as the primary display
  canvas.style.display = 'block';

  // Update frame if size is selected - this will resize the canvas
  let frameWidth, frameHeight, frameX, frameY;
  if (sizeInfo && sizeInfo.width && sizeInfo.height) {
    const frameInfo = updatePreviewFrame(sizeInfo);
    frameWidth = frameInfo.width;
    frameHeight = frameInfo.height;
    frameX = frameInfo.x;
    frameY = frameInfo.y;
  } else {
    frame.classList.add('hidden');
    // Reset canvas to original size when no size is selected
    const imageDisplay = canvas.parentElement;
    const containerWidth = imageDisplay.clientWidth;
    const containerHeight = imageDisplay.clientHeight;
    const canvasOffsetX = 16;
    const canvasOffsetY = 16;
    const availableWidth = containerWidth - (canvasOffsetX * 2);
    const availableHeight = containerHeight - (canvasOffsetY * 2);
    
    canvas.width = availableWidth;
    canvas.height = availableHeight;
    canvas.style.width = `${availableWidth}px`;
    canvas.style.height = `${availableHeight}px`;
    canvas.style.left = `${canvasOffsetX}px`;
    canvas.style.top = `${canvasOffsetY}px`;
    
    // No frame - use full canvas
    frameWidth = canvas.width;
    frameHeight = canvas.height;
    frameX = 0;
    frameY = 0;
  }

  // Fill canvas with light background
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Calculate effective frame size based on image size percentage
  // frameWidth/frameHeight from updatePreviewFrame are already correctly oriented
  const imageSizePercent = appState.imageSizePercent || 100;
  const imageSizeFactor = imageSizePercent / 100; // e.g., 80% = 0.8 factor
  const effectiveFrameWidth = frameWidth * imageSizeFactor;
  const effectiveFrameHeight = frameHeight * imageSizeFactor;
  const marginX = (frameWidth - effectiveFrameWidth) / 2;
  const marginY = (frameHeight - effectiveFrameHeight) / 2;

  // Calculate scaling based on fitting mode
  const scaleX = effectiveFrameWidth / img.naturalWidth;
  const scaleY = effectiveFrameHeight / img.naturalHeight;
  let scale, destWidth, destHeight, destX, destY;

  if (appState.fittingMode === 'fill') {
    // Fill mode: use larger scale to fill the effective frame (may crop)
    scale = Math.max(scaleX, scaleY);
    destWidth = img.naturalWidth * scale;
    destHeight = img.naturalHeight * scale;
    // Center the image within the effective frame (with margins)
    destX = frameX + marginX + (effectiveFrameWidth - destWidth) / 2;
    destY = frameY + marginY + (effectiveFrameHeight - destHeight) / 2;
  } else {
    // Fit mode: use smaller scale to fit entire image within effective frame
    scale = Math.min(scaleX, scaleY);
    destWidth = img.naturalWidth * scale;
    destHeight = img.naturalHeight * scale;
    // Center the image within the effective frame (with margins)
    destX = frameX + marginX + (effectiveFrameWidth - destWidth) / 2;
    destY = frameY + marginY + (effectiveFrameHeight - destHeight) / 2;
  }

  // Draw the image (may extend beyond frame in fill mode)
  ctx.drawImage(
    img,
    0, 0, img.naturalWidth, img.naturalHeight,
    destX, destY, destWidth, destHeight
  );

  // For low DPI, apply pixelation effect to the scaled image
  if (dpi < 150) {
    // Calculate pixelation scale based on DPI
    const pixelationScale = Math.max(0.1, dpi / 150); // 150 DPI = no pixelation, lower = more pixelation

    // Create a temporary canvas for pixelation effect
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Set temp canvas to a lower resolution based on the displayed image size
    const pixelatedWidth = Math.max(10, Math.floor(destWidth * pixelationScale));
    const pixelatedHeight = Math.max(10, Math.floor(destHeight * pixelationScale));

    tempCanvas.width = pixelatedWidth;
    tempCanvas.height = pixelatedHeight;

    // Draw the scaled image to temp canvas at low resolution
    tempCtx.drawImage(
      img,
      0, 0, img.naturalWidth, img.naturalHeight,
      0, 0, pixelatedWidth, pixelatedHeight
    );

    // Clear the area where the image is displayed
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(destX, destY, destWidth, destHeight);

    // Draw the pixelated version back to the image area (scales up, creating pixelation)
    ctx.imageSmoothingEnabled = false; // Disable smoothing to show pixels clearly
    ctx.drawImage(tempCanvas, destX, destY, destWidth, destHeight);
  } else {
    // High DPI - enable smoothing for crisp image
    ctx.imageSmoothingEnabled = true;
  }
}

// Update preview frame to match selected print size
function updatePreviewFrame(sizeInfo) {
  const frame = elements.previewFrame;
  const canvas = elements.qualityCanvas;
  const imageDisplay = canvas.parentElement; // .image-display container

  if (!sizeInfo || !sizeInfo.width || !sizeInfo.height || !appState.image) {
    frame.classList.add('hidden');
    // Reset canvas to original size
    canvas.style.width = 'calc(100% - 32px)';
    canvas.style.height = 'calc(100% - 32px)';
    return { width: 0, height: 0, x: 0, y: 0 };
  }

  // Canvas offset from container
  const canvasOffsetX = 16;
  const canvasOffsetY = 16;
  
  // Get the container dimensions
  const containerWidth = imageDisplay.clientWidth;
  const containerHeight = imageDisplay.clientHeight;
  
  // Available space for canvas (container minus offsets)
  const availableWidth = containerWidth - (canvasOffsetX * 2);
  const availableHeight = containerHeight - (canvasOffsetY * 2);

  // Determine image orientation
  const imageAspectRatio = appState.image.width / appState.image.height;
  const isImageLandscape = imageAspectRatio > 1;

  // Calculate the aspect ratio of the selected print size
  let printAspectRatio = sizeInfo.width / sizeInfo.height;
  const isPrintSizeLandscape = printAspectRatio > 1;

  // Match frame orientation to image orientation
  // If image and print size have different orientations, swap print size dimensions
  if (isImageLandscape !== isPrintSizeLandscape) {
    printAspectRatio = 1 / printAspectRatio; // Swap width/height ratio
  }

  // Calculate frame dimensions based on print size aspect ratio
  let frameWidth, frameHeight;
  
  if (printAspectRatio > availableWidth / availableHeight) {
    // Frame is wider - fit to available width
    frameWidth = availableWidth;
    frameHeight = availableWidth / printAspectRatio;
  } else {
    // Frame is taller - fit to available height
    frameHeight = availableHeight;
    frameWidth = availableHeight * printAspectRatio;
  }

  // For fill mode, calculate canvas size to accommodate the full scaled image
  let canvasWidth, canvasHeight;
  if (appState.fittingMode === 'fill' && appState.image) {
    const img = appState.image;
    const imageAspectRatio = img.width / img.height;
    
    // Calculate how large the image will be when scaled to fill the frame
    const fillScaleX = frameWidth / img.width;
    const fillScaleY = frameHeight / img.height;
    const fillScale = Math.max(fillScaleX, fillScaleY); // Use larger scale for fill
    
    const scaledImageWidth = img.width * fillScale;
    const scaledImageHeight = img.height * fillScale;
    
    // Canvas needs to be large enough to show the full scaled image
    canvasWidth = Math.max(frameWidth, scaledImageWidth);
    canvasHeight = Math.max(frameHeight, scaledImageHeight);
    
    // But don't exceed available space
    canvasWidth = Math.min(canvasWidth, availableWidth);
    canvasHeight = Math.min(canvasHeight, availableHeight);
  } else {
    // Fit mode: canvas matches frame size
    canvasWidth = frameWidth;
    canvasHeight = frameHeight;
  }

  // Center the canvas within the available space
  const canvasX = (availableWidth - canvasWidth) / 2;
  const canvasY = (availableHeight - canvasHeight) / 2;

  // Update canvas size and position
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
  canvas.style.left = `${canvasOffsetX + canvasX}px`;
  canvas.style.top = `${canvasOffsetY + canvasY}px`;

  // Frame dimensions (frame may be smaller than canvas in fill mode)
  const frameX = (canvasWidth - frameWidth) / 2;
  const frameY = (canvasHeight - frameHeight) / 2;

  // Position and size the frame (centered within canvas)
  frame.style.width = `${frameWidth}px`;
  frame.style.height = `${frameHeight}px`;
  frame.style.left = `${canvasOffsetX + canvasX + frameX}px`;
  frame.style.top = `${canvasOffsetY + canvasY + frameY}px`;
  frame.classList.remove('hidden');

  // Return frame dimensions for use in image scaling
  return {
    width: frameWidth,
    height: frameHeight,
    x: frameX,
    y: frameY
  };
}

// Handle size selection
function selectSize(result, sizeInfo) {
  appState.selectedSize = result.size;
  appState.selectedGrade = result.grade;
  appState.selectedExplanation = result.explanation;
  appState.backgroundColor = getGradeColor(result.dpi);

  // Reset fitting mode and image size to defaults when selecting a new size
  appState.fittingMode = 'fit';
  appState.imageSizePercent = 100;

  // Update button states to reflect defaults
  document.querySelectorAll('.fitting-button').forEach(btn => {
    if (btn.getAttribute('data-mode') === 'fit') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Show fitting controls when a size is selected
  elements.fittingControls.classList.remove('hidden');

  // Update DOM - all info now shown in image analysis
  updateImageAnalysis();

  // Hide the separate size details panel since info is now in analysis
  elements.sizeDetails.classList.add('hidden');

  // Update selected button
  document.querySelectorAll('.size-option').forEach(btn => {
    btn.classList.remove('selected');
    // Find the button that matches this size
    const buttonText = btn.querySelector('span')?.textContent || btn.textContent.trim();
    if (buttonText === result.size) {
      btn.classList.add('selected');
    }
  });
}

// Set fitting mode and update preview
function setFittingMode(mode) {
  appState.fittingMode = mode;
  
  // Reset image size to 100% when switching fit/fill modes
  appState.imageSizePercent = 100;
  
  // Update button states
  document.querySelectorAll('.fitting-button').forEach(btn => {
    if (btn.getAttribute('data-mode') === mode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update preview and analysis if a size is selected
  if (appState.selectedSize && appState.analysis) {
    const selectedResult = appState.analysis.find(r => r.size === appState.selectedSize);
    if (selectedResult) {
      const sizeInfo = [...COMMON_SIZES, ...appState.customSizes].find(size => size.name === appState.selectedSize);
      // Update both the preview and the analysis text
      // updateImageAnalysis() will calculate DPI and call updateDpiPreview() internally
      updateImageAnalysis();
    }
  }
}

// Adjust image size and update preview
function adjustImageSize(delta) {
  appState.imageSizePercent = Math.max(50, Math.min(200, (appState.imageSizePercent || 100) + delta));
  
  // Update preview and analysis if a size is selected
  if (appState.selectedSize && appState.analysis) {
    const selectedResult = appState.analysis.find(r => r.size === appState.selectedSize);
    if (selectedResult) {
      const sizeInfo = [...COMMON_SIZES, ...appState.customSizes].find(size => size.name === appState.selectedSize);
      // Update both the preview and the analysis text
      // updateImageAnalysis() will calculate DPI and call updateDpiPreview() internally
      updateImageAnalysis();
    }
  }
}

// Toggle URL input form
function toggleUrlInput() {
  elements.urlForm.classList.toggle('hidden');
}

// Handle URL form submission
function handleUrlSubmit(event) {
  event.preventDefault();
  const url = elements.urlInput.value.trim();

  if (url) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        const imageData = {
          file: file,
          width: img.width,
          height: img.height,
          src: url
        };
        handleImageUpload(imageData);
      }, 'image/jpeg');
    };
    img.onerror = () => {
      console.error('Error loading image from URL');
    };
    img.src = url;
  }

  elements.urlForm.classList.add('hidden');
  elements.urlInput.value = '';
}

// Toggle custom size form
function toggleCustomSizeForm() {
  elements.customSizeForm.classList.toggle('hidden');
  // Note: customSizeButton was removed, now using + button in grid
}

// Hide custom size form
function hideCustomSizeForm() {
  elements.customSizeForm.classList.add('hidden');
  // Note: customSizeButton was removed, now using + button in grid

  // Reset form fields and re-enable them
  const widthField = document.querySelector('.width-field');
  const heightField = document.querySelector('.height-field');
  const ratioField = document.querySelector('.ratio-field');

  widthField.value = '';
  heightField.value = '';
  ratioField.value = '';

  // Re-enable all fields
  widthField.disabled = false;
  heightField.disabled = false;
  ratioField.disabled = false;
  widthField.style.opacity = '1';
  heightField.style.opacity = '1';
  ratioField.style.opacity = '1';

  // Reset field states
  customSizeFieldStates = {
    width: { value: '', manuallyEntered: false },
    height: { value: '', manuallyEntered: false },
    ratio: { value: '', manuallyEntered: false }
  };
}

// Handle custom size submission
function handleCustomSizeSubmit(event) {
  event.preventDefault();

  const widthField = document.querySelector('.width-field');
  const heightField = document.querySelector('.height-field');
  const ratioField = document.querySelector('.ratio-field');

  const width = parseFloat(widthField.value);
  const height = parseFloat(heightField.value);
  const ratioText = ratioField.value.trim();
  const unit = elements.unitToggle.textContent;

  // Need at least width and height to submit
  if (width && height && appState.image) {
    let widthInInches, heightInInches;

    if (unit === 'cm') {
      widthInInches = Math.round(width / 2.54);
      heightInInches = Math.round(height / 2.54);
    } else {
      widthInInches = width;
      heightInInches = height;
    }

    const newSize = {
      name: `${Math.round(width)}x${Math.round(height)}`,
      width: widthInInches,
      height: heightInInches,
      description: 'Custom size',
      unit: unit
    };

    appState.customSizes.push(newSize);
    analyzeImage(appState.image.width, appState.image.height);

    // Reset form
    widthField.value = '';
    heightField.value = '';
    ratioField.value = '';
    hideCustomSizeForm();
  }
}

// Handle custom size input (debounced calculation)
function handleCustomSizeInput() {
  // Clear existing timer
  if (customSizeDebounceTimer) {
    clearTimeout(customSizeDebounceTimer);
  }

  // Set new timer to calculate after user stops typing (300ms delay)
  customSizeDebounceTimer = setTimeout(() => {
    performCustomSizeCalculation();
  }, 300);
}

// Perform the actual calculation
function performCustomSizeCalculation() {
  const widthField = document.querySelector('.width-field');
  const heightField = document.querySelector('.height-field');
  const ratioField = document.querySelector('.ratio-field');

  const width = parseFloat(widthField.value) || 0;
  const height = parseFloat(heightField.value) || 0;
  const ratioText = ratioField.value.trim();

  // Determine which fields have values
  const hasWidth = width > 0;
  const hasHeight = height > 0;
  const hasRatio = ratioText.length > 0;

  const filledCount = [hasWidth, hasHeight, hasRatio].filter(Boolean).length;

  // Update field states
  customSizeFieldStates.width.value = widthField.value;
  customSizeFieldStates.height.value = heightField.value;
  customSizeFieldStates.ratio.value = ratioField.value;

  // Determine if we should lock fields: only when user actively filled exactly 2 fields
  const manuallyFilledCount = Object.values(customSizeFieldStates).filter(state => state.manuallyEntered && state.value.trim()).length;

  if (manuallyFilledCount === 2 && filledCount === 2) {
    // Lock the field that would be calculated when exactly 2 fields are manually filled
    if (hasWidth && hasHeight && !hasRatio) {
      // Width + Height manually filled, ratio should be locked
      ratioField.disabled = true;
      ratioField.style.opacity = '0.6';
      customSizeFieldStates.ratio.manuallyEntered = false; // Mark as auto-calculated
    } else if (hasWidth && hasRatio && !hasHeight) {
      // Width + Ratio manually filled, height should be locked
      heightField.disabled = true;
      heightField.style.opacity = '0.6';
      customSizeFieldStates.height.manuallyEntered = false; // Mark as auto-calculated
    } else if (hasHeight && hasRatio && !hasWidth) {
      // Height + Ratio manually filled, width should be locked
      widthField.disabled = true;
      widthField.style.opacity = '0.6';
      customSizeFieldStates.width.manuallyEntered = false; // Mark as auto-calculated
    }
  } else {
    // Enable all fields when not exactly 2 manually filled fields
    // Also clear any auto-calculated fields when manually filled count drops
    if (manuallyFilledCount < 2) {
      // Clear auto-calculated fields
      if (!customSizeFieldStates.width.manuallyEntered) {
        widthField.value = '';
        customSizeFieldStates.width.value = '';
      }
      if (!customSizeFieldStates.height.manuallyEntered) {
        heightField.value = '';
        customSizeFieldStates.height.value = '';
      }
      if (!customSizeFieldStates.ratio.manuallyEntered) {
        ratioField.value = '';
        customSizeFieldStates.ratio.value = '';
      }
    }

    widthField.disabled = false;
    heightField.disabled = false;
    ratioField.disabled = false;
    widthField.style.opacity = '1';
    heightField.style.opacity = '1';
    ratioField.style.opacity = '1';
  }

  // Only perform calculations when we have exactly 2 manually filled fields
  // This prevents repopulating cleared fields
  if (manuallyFilledCount === 2) {
    try {
      // Priority 1: If width and height are both available, calculate/update ratio
      if (hasWidth && hasHeight) {
        const decimalRatio = width / height;
        ratioField.value = Math.round(decimalRatio * 100) / 100;
        customSizeFieldStates.ratio.manuallyEntered = false; // Mark as auto-calculated
      }
      // Priority 2: If width and ratio are available but height is missing, calculate height
      else if (hasWidth && hasRatio && !hasHeight) {
        const ratio = parseRatio(ratioText);
        if (ratio) {
          // For decimal ratio (e.g., 1.78), height = width / ratio
          const calculatedHeight = width / ratio.width;
          heightField.value = Math.round(calculatedHeight * 100) / 100;
          customSizeFieldStates.height.manuallyEntered = false; // Mark as auto-calculated
        }
      }
      // Priority 3: If height and ratio are available but width is missing, calculate width
      else if (hasHeight && hasRatio && !hasWidth) {
        const ratio = parseRatio(ratioText);
        if (ratio) {
          // For decimal ratio (e.g., 1.78), width = height * ratio
          const calculatedWidth = height * ratio.width;
          widthField.value = Math.round(calculatedWidth * 100) / 100;
          customSizeFieldStates.width.manuallyEntered = false; // Mark as auto-calculated
        }
      }
    } catch (e) {
      // Ignore calculation errors
    }
  }
}

// Parse ratio string (decimal like "1.78" or colon format "16:9")
function parseRatio(ratioText) {
  // Try decimal format first (e.g., "1.78")
  const decimalMatch = ratioText.match(/^(\d+(?:\.\d+)?)$/);
  if (decimalMatch) {
    const ratio = parseFloat(decimalMatch[1]);
    if (ratio > 0) {
      return { width: ratio, height: 1 };
    }
  }

  // Try colon format (e.g., "16:9")
  const colonMatch = ratioText.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);
  if (colonMatch) {
    const width = parseFloat(colonMatch[1]);
    const height = parseFloat(colonMatch[2]);
    if (width > 0 && height > 0) {
      return { width, height };
    }
  }

  return null;
}

// Calculate greatest common divisor
function calculateGCD(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// Remove custom size
function removeCustomSize(sizeName) {
  appState.customSizes = appState.customSizes.filter(size => size.name !== sizeName);

  // If the removed size was selected, clear selection
  if (appState.selectedSize === sizeName) {
    appState.selectedSize = null;
    appState.selectedGrade = null;
    appState.selectedExplanation = null;
    appState.backgroundColor = '';
    updateImageAnalysis(); // Update to show max size again
    updateDpiPreview(300, null); // Reset to perfect quality preview
  }

  // Re-analyze with updated custom sizes
  if (appState.image) {
    analyzeImage(appState.image.width, appState.image.height);
  }
}

// Toggle unit (inches/centimeters)
function toggleUnit() {
  elements.unitToggle.textContent = elements.unitToggle.textContent === 'in' ? 'cm' : 'in';
}

// Validate numeric input (only allow positive numbers with decimals)
function validateNumericInput(event) {
  const value = event.target.value;
  // Allow numbers, decimal points, and empty string
  if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
    event.target.value = value.replace(/[^\d.]/g, '');
  }
  // Ensure only one decimal point
  const parts = event.target.value.split('.');
  if (parts.length > 2) {
    event.target.value = parts[0] + '.' + parts.slice(1).join('');
  }
}

// Handle drag and drop
function handleDrop(event) {
  event.preventDefault();
  event.stopPropagation();

  const files = event.dataTransfer.files;
  if (files && files[0]) {
    processImageFile(files[0]);
  }
}

function handleDragOver(event) {
  event.preventDefault();
  event.stopPropagation();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
