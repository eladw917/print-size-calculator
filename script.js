// State management - replacing React useState
let appState = {
  image: null,
  analysis: null,
  selectedSize: null,
  selectedGrade: null,
  selectedExplanation: null,
  backgroundColor: '',
  customSizes: []
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
  imageTitle: document.getElementById('image-title'),
  uploadedImage: document.getElementById('uploaded-image'),
  imageAnalysis: document.getElementById('image-analysis'),
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
  elements.imageTitle.textContent = `Uploaded Image (${imageData.width} x ${imageData.height} pixels)`;

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

      elements.imageAnalysis.innerHTML = `
        <div class="analysis-text">
          <div class="analysis-summary">
            <strong>Selected Size:</strong> ${sizeDisplay}<br>
            <strong>Quality:</strong> ${selectedResult.grade} (${selectedResult.dpi} DPI)<br>
            <strong>Details:</strong> ${selectedResult.explanation}
          </div>
        </div>
      `;
    }
  } else {
    // Show maximum print size at 300 DPI
    const maxWidthInches = Math.round((imgWidth / 300) * 100) / 100;
    const maxHeightInches = Math.round((imgHeight / 300) * 100) / 100;

    // Convert to cm if needed
    const unit = elements.unitToggle.textContent;
    let displayWidth = maxWidthInches;
    let displayHeight = maxHeightInches;
    let unitText = 'in';

    if (unit === 'cm') {
      displayWidth = Math.round((maxWidthInches * 2.54) * 100) / 100;
      displayHeight = Math.round((maxHeightInches * 2.54) * 100) / 100;
      unitText = 'cm';
    }

    elements.imageAnalysis.innerHTML = `
      <div class="analysis-text">
        <strong>Max print size at 300 DPI:</strong> ${displayWidth} × ${displayHeight} ${unitText}
      </div>
    `;
  }
}

// Handle size selection
function selectSize(result, sizeInfo) {
  appState.selectedSize = result.size;
  appState.selectedGrade = result.grade;
  appState.selectedExplanation = result.explanation;
  appState.backgroundColor = getGradeColor(result.dpi);

  // Update DOM - all info now shown in image analysis
  updateImageAnalysis();

  // Hide the separate size details panel since info is now in analysis
  elements.sizeDetails.classList.add('hidden');

  // Update selected button
  document.querySelectorAll('.size-option').forEach(btn => {
    btn.classList.remove('selected');
  });
  event.target.classList.add('selected');
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
