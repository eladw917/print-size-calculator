# Print Size Calculator

A web application that analyzes image resolution and determines optimal print sizes with intelligent DPI calculations.

## 🚀 Features

- **Image Upload**: Drag & drop or file picker support
- **URL Input**: Load images from web URLs
- **DPI Analysis**: Calculate optimal print sizes at various quality levels
- **Quality Grading**: Color-coded Excellent/Good/Fair/Poor ratings
- **Custom Sizes**: Add your own print dimensions with ratio calculation
- **Dual Units**: Display dimensions in both inches and centimeters
- **Responsive Design**: Works on desktop and mobile devices

## 📁 Project Structure

```
print-size-calculator/
├── index.html              # Main HTML file
├── styles.css              # Complete styling
├── script.js               # Application logic
├── assets/                 # Static assets
│   ├── favicon.ico
│   ├── android-chrome-*.png
│   └── site.webmanifest
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── package.json           # Dependencies (for potential future use)
```

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **No Build Process**: Direct deployment ready
- **Analytics**: Google Analytics 4 integration
- **Icons**: Inline SVG icons (no external dependencies)

## 🎯 Core Functionality

### Image Processing
- File validation and drag & drop handling
- Image dimension extraction
- Data URL conversion for display

### DPI Calculations
- Pixel density analysis: `DPI = image_pixels / print_inches`
- Quality thresholds:
  - **Excellent**: 300+ DPI
  - **Good**: 200-300 DPI
  - **Fair**: 150-199 DPI
  - **Poor**: <150 DPI

### Size Database
- **Standard Sizes**: 4x6, 5x7, 8x10, 11x14, etc.
- **A-Series**: A6, A5, A4, A3, A2, A1, A0
- **Metric Sizes**: 10x15, 13x18, 15x20, 20x25, 20x30, 30x40, 50x70, 70x100 cm
- **Custom Sizes**: User-defined with automatic ratio calculation

### Smart Input System
- **Auto-calculation**: Enter 2 values, 3rd calculates automatically
- **Ratio Support**: Accepts both "16:9" and "1.78" formats
- **Unit Conversion**: Automatic inch ↔ cm conversion
- **Field Locking**: Prevents editing calculated values

## 🎨 UI Components

### Header Section
- Gradient background with modern styling
- Upload and URL input buttons
- Responsive button layout

### Image Display
- Uploaded image preview
- Dimensions display in title: "Uploaded Image (1920 x 1080 pixels)"
- Analysis overlay with print recommendations

### Size Selector
- Grid of size buttons with color-coded quality
- "+" button for custom sizes
- Click to select and view detailed analysis

### Custom Size Form
- Three input fields: Width, Height, Ratio
- Smart auto-calculation between fields
- Unit toggle (inches/centimeters)
- Real-time validation and ratio simplification

### Analysis Display
- Shows selected size dimensions in both units
- Quality rating with DPI information
- Detailed print recommendations

## 🔧 Key Functions

### `handleImageUpload(imageData)`
- Processes uploaded images
- Extracts dimensions and creates data URLs
- Triggers analysis calculations

### `analyzeImage(width, height, sizes)`
- Calculates DPI for all available sizes
- Assigns quality grades based on DPI thresholds
- Updates the size grid with color coding

### `updateImageAnalysis()`
- Displays appropriate analysis based on selection state
- Shows max print size when no selection
- Shows detailed analysis for selected sizes

### `selectSize(result, sizeInfo)`
- Updates UI for size selection
- Shows analysis and highlights selected button

### `performCustomSizeCalculation()`
- Handles the smart input system
- Auto-calculates missing dimensions
- Manages field locking based on manually entered values

## 📱 Usage

1. **Upload Image**: Drag & drop or click "Upload Image"
2. **View Analysis**: See recommended max print size
3. **Select Sizes**: Click size buttons to see quality analysis
4. **Add Custom**: Use "+" button for custom dimensions
5. **Smart Input**: Enter 2 values, 3rd calculates automatically

## 🚀 Deployment

### Static Hosting (Recommended)
Deploy directly to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

Simply upload the 3 core files:
- `index.html`
- `styles.css`
- `script.js`

### Local Development
```bash
# Using Python
python3 -m http.server 8000

# Or using Node.js
npx serve .

# Then open http://localhost:8000
```

## 🔄 Migration Notes

This application was originally built with Next.js React and has been converted to vanilla HTML/CSS/JS for:

- **Zero dependencies** in production
- **No build process** required
- **Direct deployment** capability
- **Smaller bundle size**
- **Better performance**

Original Next.js files remain in `src/` for reference.

## 📊 Analytics

Integrated Google Analytics 4 with tracking ID: `G-P35QPLTGWT`
- Image upload events
- Size selection interactions
- User engagement metrics

## 🎨 Design System

### Colors
- **Quality Colors**: Green (#10B981) for Excellent, Yellow (#F59E0B) for Good, Orange (#F97316) for Fair, Red (#EF4444) for Poor
- **UI Colors**: Blue gradient header, clean white backgrounds
- **Text**: Dark gray (#374151) for readability

### Typography
- **Font**: Arial system font for consistency
- **Sizes**: Responsive scaling from 1.2rem to 1.6rem
- **Hierarchy**: Clear heading and body text distinction

### Spacing
- **Container**: Max 800px width, centered
- **Padding**: 1.6rem standard, 2.4rem on larger screens
- **Margins**: 0.5rem between major sections

## 🐛 Known Limitations

- Custom sizes are not persisted between sessions
- Large images may cause performance issues
- No image editing capabilities (crop, rotate, etc.)
- Browser compatibility: Modern browsers with ES6+ support

## 🔮 Future Enhancements

- Image compression and optimization
- Batch processing for multiple images
- Print templates and layouts
- Advanced image analysis (color depth, etc.)
- Offline functionality with service workers
- Internationalization support

## 📄 License

This project is open source. Feel free to use, modify, and distribute.

---

**Built with ❤️ for photographers, designers, and print enthusiasts**
