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

// DOM element references
const elements = {
  calcContainer: document.querySelector('.calc-container'),
  imageDimensions: document.getElementById('image-dimensions'),
  uploadedImage: document.getElementById('uploaded-image'),
  imageOverlay: document.querySelector('.image-overlay'),
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
  customSizeButton: document.querySelector('.custom-size-button'),
  customSizeForm: document.querySelector('.custom-size-form'),
  customSizeInputs: document.querySelectorAll('.custom-size-form input'),
  unitToggle: document.querySelector('.unit-toggle'),
  cancelButton: document.querySelector('.cancel-button'),
  fileInput: document.querySelector('.hidden-input')
};

// Common sizes data
const COMMON_SIZES = [
  { name: '4x6', width: 4, height: 6, description: 'Common photo size for albums' },
  { name: '5x7', width: 5, height: 7, description: 'Common photo size for frames' },
  { name: 'A6', width: 4.1, height: 5.8, description: 'Postcard size' },
  { name: 'A5', width: 5.8, height: 8.3, description: 'Half of A4, used for notebooks' },
  { name: '8x10', width: 8, height: 10, description: 'Standard photo size for portraits' },
  { name: 'A4', width: 8.3, height: 11.7, description: 'Standard letter size paper' },
  { name: 'A3', width: 11.7, height: 16.5, description: 'Used for posters and drawings' },
  { name: '11x14', width: 11, height: 14, description: 'Common print size for photos' },
  { name: '12x18', width: 12, height: 18, description: 'Common poster size' },
  { name: 'A2', width: 16.5, height: 23.4, description: 'Used for large posters' },
  { name: '16x20', width: 16, height: 20, description: 'Common size for wall art' },
  { name: '16x24', width: 16, height: 24, description: 'Common poster size' },
  { name: '18x24', width: 18, height: 24, description: 'Used for movie posters' },
  { name: '20x30', width: 20, height: 30, description: 'Large poster size' },
  { name: 'A1', width: 23.4, height: 33.1, description: 'Used for large prints and posters' },
  { name: '24x30', width: 24, height: 30, description: 'Common print size for art' },
  { name: '24x36', width: 24, height: 36, description: 'Standard movie poster size' },
  { name: 'A0', width: 33.1, height: 46.8, description: 'Used for large format prints' },
  { name: '30x40', width: 30, height: 40, description: 'Large wall photo size' },
  { name: '30x60', width: 30, height: 60, description: 'Common banner size' },
  { name: '36x48', width: 36, height: 48, description: 'Large poster size' },
  { name: '48x72', width: 48, height: 72, description: 'Extra large poster size' }
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

  // Custom size button
  elements.customSizeButton.addEventListener('click', toggleCustomSizeForm);

  // Custom size form
  elements.customSizeForm.addEventListener('submit', handleCustomSizeSubmit);
  elements.cancelButton.addEventListener('click', hideCustomSizeForm);

  // Unit toggle
  elements.unitToggle.addEventListener('click', toggleUnit);

  // Drag and drop
  document.addEventListener('drop', handleDrop);
  document.addEventListener('dragover', handleDragOver);

  // Input validation for custom size inputs
  elements.customSizeInputs.forEach(input => {
    input.addEventListener('input', validateInput);
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
  elements.imageDimensions.textContent = `${imageData.width} x ${imageData.height} pixels`;

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

    const button = document.createElement('button');
    button.className = `size-option ${appState.selectedSize === result.size ? 'selected' : ''}`;
    button.style.backgroundColor = getGradeColor(result.dpi);
    button.textContent = result.size;
    button.setAttribute('data-unit', sizeInfo?.unit || 'in');
    button.title = sizeInfo?.description || '';

    button.addEventListener('click', () => selectSize(result, sizeInfo));

    elements.sizeGrid.appendChild(button);
  });
}

// Handle size selection
function selectSize(result, sizeInfo) {
  appState.selectedSize = result.size;
  appState.selectedGrade = result.grade;
  appState.selectedExplanation = result.explanation;
  appState.backgroundColor = getGradeColor(result.dpi);

  // Update DOM
  elements.imageOverlay.innerHTML = `
    <h4>${result.size}</h4>
    <p>${result.grade}</p>
  `;
  elements.imageOverlay.style.backgroundColor = appState.backgroundColor;

  elements.sizeDetails.classList.remove('hidden');
  elements.selectedSize.textContent = result.size;
  elements.selectedGrade.textContent = result.grade;
  elements.selectedDpi.textContent = result.dpi;
  elements.selectedExplanation.textContent = result.explanation;

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
  elements.customSizeButton.style.display = elements.customSizeForm.classList.contains('hidden') ? 'flex' : 'none';
}

// Hide custom size form
function hideCustomSizeForm() {
  elements.customSizeForm.classList.add('hidden');
  elements.customSizeButton.style.display = 'flex';
}

// Handle custom size submission
function handleCustomSizeSubmit(event) {
  event.preventDefault();

  const widthInput = document.querySelector('.custom-size-form input[placeholder="Width"]');
  const heightInput = document.querySelector('.custom-size-form input[placeholder="Height"]');
  const width = parseInt(widthInput.value);
  const height = parseInt(heightInput.value);
  const unit = elements.unitToggle.textContent;

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
      name: `${width}x${height}`,
      width: widthInInches,
      height: heightInInches,
      description: 'Custom size',
      unit: unit
    };

    appState.customSizes.push(newSize);
    analyzeImage(appState.image.width, appState.image.height);

    // Reset form
    widthInput.value = '';
    heightInput.value = '';
    hideCustomSizeForm();
  }
}

// Toggle unit (inches/centimeters)
function toggleUnit() {
  elements.unitToggle.textContent = elements.unitToggle.textContent === 'in' ? 'cm' : 'in';
}

// Validate input (only allow positive integers)
function validateInput(event) {
  const value = event.target.value;
  if (value !== '' && !/^[1-9]\d*$/.test(value)) {
    event.target.value = value.replace(/[^1-9\d]/g, '');
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
