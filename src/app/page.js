"use client"; // Add this line at the top

import React, { useState, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { Helmet } from 'react-helmet';
import { AlertCircle, Upload, RefreshCw, Info } from 'lucide-react';
import '../styles/PosterPrintChecker.css';

const PosterPrintChecker = () => {
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDPI, setSelectedDPI] = useState(300);
  const [selectedSize, setSelectedSize] = useState(null);
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [customUnit, setCustomUnit] = useState('inches');

  const analyzeImage = useCallback((file) => {
    const img = new Image();
    img.onload = function() {
      const width = this.width;
      const height = this.height;
      const aspectRatio = (width / height).toFixed(2);
      const megapixels = ((width * height) / 1000000).toFixed(2);

      setResult({
        width,
        height,
        aspectRatio,
        megapixels,
        suitable: parseFloat(megapixels) >= 6
      });
    }
    img.src = URL.createObjectURL(file);
    setPreviewUrl(img.src);
  }, []);

  const analysis = useMemo(() => {
    if (!result) return null;

    let width, height, dpi, maxDpi;

    if (selectedSize !== null) {
      if (selectedSize === 'custom') {
        width = parseFloat(customWidth);
        height = parseFloat(customHeight);
        if (isNaN(width) || isNaN(height)) return null;
        if (customUnit === 'cm') {
          width /= 2.54;
          height /= 2.54;
        }
      } else if (COMMON_SIZES[selectedSize]) {
        width = COMMON_SIZES[selectedSize].width;
        height = COMMON_SIZES[selectedSize].height;
      } else {
        return null;
      }
      maxDpi = Math.min(result.width / width, result.height / height);
      dpi = maxDpi; // Use max DPI when size is selected
    } else {
      dpi = selectedDPI;
      width = result.width / dpi;
      height = result.height / dpi;
      maxDpi = Math.min(result.width / width, result.height / height);
    }

    const widthCm = width * 2.54;
    const heightCm = height * 2.54;

    let quality;
    if (dpi >= 300) quality = "Excellent";
    else if (dpi >= 200) quality = "Good";
    else if (dpi >= 150) quality = "Fair";
    else quality = "Poor";

    const qualityScore = Math.min(100, Math.round((dpi / 300) * 100));

    return { 
      dpi: dpi.toFixed(0),
      maxDpi: maxDpi.toFixed(0),
      quality,
      qualityScore,
      width: width.toFixed(2),
      height: height.toFixed(2),
      widthCm: widthCm.toFixed(2),
      heightCm: heightCm.toFixed(2)
    };
  }, [result, selectedDPI, selectedSize, customWidth, customHeight, customUnit]);

  const handleFile = useCallback((file) => {
    if (file && file.type.startsWith('image/')) {
      analyzeImage(file);
    } else {
      alert('Please upload a valid image file.');
    }
  }, [analyzeImage]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleReset = useCallback(() => {
    setResult(null);
    setPreviewUrl('');
    setSelectedDPI(300);
    setSelectedSize(null);
    setCustomWidth('');
    setCustomHeight('');
    setCustomUnit('inches');
    setIsDragging(false);
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);

  return (
    <>
      <Head>
        <title>Poster Print Checker</title>
        <meta name="description" content="Check if your image is suitable for poster printing." />
        <meta property="og:title" content="Poster Print Checker" />
        <meta property="og:description" content="Check if your image is suitable for poster printing." />
        <meta property="og:image" content="/path/to/your/image.jpg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://printsizecalculator.com/" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Poster Print Checker</title>
        <meta name="description" content="Check if your image is suitable for poster printing." />
        <meta property="og:title" content="Poster Print Checker" />
        <meta property="og:description" content="Check if your image is suitable for poster printing." />
        <meta property="og:image" content="/path/to/your/image.jpg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://printsizecalculator.com/" />
      </Helmet>
      <nav className="navbar">
        <div className="navbar-container">
          <h1 className="navbar-title">Print Size Calculator</h1>
          <ul className="navbar-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </nav>
      <div className="container">
        <div className="main-container">
          <div className="calc-container">
            <button 
              type="button" 
              className="btn reset-btn"
              onClick={handleReset}
            >
              Reset
            </button>
            <p>Upload an image to check if it's suitable for poster printing.</p>
            <div 
              className={`dropzone ${isDragging ? 'dragging' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])}
                className="file-input-hidden"
                id="fileInput"
              />
              <label htmlFor="fileInput" className="dropzone-label">
                <Upload className="icon" />
                <p>Drag and drop an image here, or click to select a file</p>
                <button 
                  type="button" 
                  className="btn file-btn"
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  Choose File
                </button>
              </label>
            </div>

            {previewUrl && (
              <div className="preview">
                <h2>Image Preview</h2>
                <img src={previewUrl} alt="Preview" className="preview-image" />
              </div>
            )}

            {result && (
              <>
                <div className={`result ${result.suitable ? 'suitable' : 'not-suitable'}`}>
                  <div className="result-content">
                    <AlertCircle className={`icon ${result.suitable ? 'suitable-icon' : 'not-suitable-icon'}`} />
                    <p>
                      {result.suitable 
                        ? "This image is suitable for poster printing!" 
                        : "This image might not be suitable for large poster prints. Consider using a higher resolution image."}
                    </p>
                  </div>
                </div>

                <div className="analysis">
                  <h2>Image Analysis</h2>
                  <p>Dimensions: {result.width}x{result.height} pixels</p>
                  <p>Aspect Ratio: {result.aspectRatio}</p>
                  <p>Megapixels: {result.megapixels}</p>
                  
                  <h3>Poster Print Calculator</h3>
                  
                  <div className="dpi-buttons">
                    <label className="flex items-center">
                      DPI:
                      <div className="tooltip">
                        <div className="tooltip-trigger">
                          <Info className="icon" />
                        </div>
                        <div className="tooltip-content">
                          <p>DPI (Dots Per Inch) affects print quality. Higher DPI generally means better quality.</p>
                        </div>
                      </div>
                    </label>
                    {[150, 300, 600].map((dpi) => (
                      <button 
                        key={dpi}
                        className={`btn xs ${selectedDPI === dpi && selectedSize === null ? 'default' : 'outline'}`}
                        onClick={() => {
                          setSelectedDPI(dpi);
                          setSelectedSize(null);
                        }}
                      >
                        <div>{dpi}</div>
                        <div>{dpi === 150 ? "(Standard)" : dpi === 300 ? "(High)" : "(Ultra-High)"}</div>
                      </button>
                    ))}
                    {analysis && (
                      <button 
                        className={`btn xs ${selectedSize !== null ? 'default' : 'outline'}`}
                        onClick={() => {
                          setSelectedSize(selectedSize === null ? 0 : selectedSize);
                          setSelectedDPI(parseInt(analysis.maxDpi));
                        }}
                      >
                        <div>{analysis.maxDpi}</div>
                        <div>{analysis.maxDpi ? "(Max)" : 'Max DPI'}</div>
                      </button>
                    )}
                  </div>

                  <div className="size-buttons">
                    <label>Select Poster Size:</label>
                    <div className="size-grid">
                      {COMMON_SIZES.map((size, index) => (
                        <button
                          key={size.name}
                          className={`btn xs ${selectedSize === index ? 'default' : 'outline'}`}
                          onClick={() => setSelectedSize(index)}
                        >
                          <span className="text-left">
                            {size.width}" x {size.height}" ({size.widthCm} cm x {size.heightCm} cm)
                          </span>
                        </button>
                      ))}
                      <button
                        className={`btn xs ${selectedSize === 'custom' ? 'default' : 'outline'}`}
                        onClick={() => setSelectedSize('custom')}
                      >
                        Custom
                      </button>
                    </div>
                  </div>

                  {selectedSize === 'custom' && (
                    <div className="custom-size">
                      <div className="custom-size-inputs">
                        <div>
                          <input 
                            type="number"
                            value={customWidth}
                            onChange={(e) => setCustomWidth(e.target.value)}
                            placeholder="Width"
                            className="input"
                          />
                        </div>
                        <div>
                          <input 
                            type="number"
                            value={customHeight}
                            onChange={(e) => setCustomHeight(e.target.value)}
                            placeholder="Height"
                            className="input"
                          />
                        </div>
                      </div>
                      <div className="unit-buttons">
                        <button 
                          className={`btn sm ${customUnit === 'inches' ? 'default' : 'outline'}`}
                          onClick={() => setCustomUnit('inches')}
                        >
                          Inches
                        </button>
                        <button 
                          className={`btn sm ${customUnit === 'cm' ? 'default' : 'outline'}`}
                          onClick={() => setCustomUnit('cm')}
                        >
                          Centimeters
                        </button>
                      </div>
                    </div>
                  )}
                  {analysis && (
                    <div className="analysis-results">
                      <h4>Analysis Results:</h4>
                      <p>Print Size: {analysis.width}" x {analysis.height}" ({analysis.widthCm} cm x {analysis.heightCm} cm)</p>
                      <p>Effective DPI: {analysis.dpi}</p>
                      <div className="quality-bar">
                        <label>Print Quality:</label>
                        <div className="quality-bar-container">
                          <div 
                            className="quality-bar-fill" 
                            style={{width: `${analysis.qualityScore}%`}}
                          ></div>
                        </div>
                        <span>{analysis.quality} ({analysis.qualityScore}%)</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="explenation-container">
            <h2>Explanation</h2>
            <p>This is a poster print checker that will help you determine if your image is suitable for poster printing.</p>
            <p>Here's how the app works and the steps to use it:</p>
            <ol>
              <li><strong>Upload an Image:</strong> Drag and drop an image into the designated area or click to select a file from your device.</li>
              <li><strong>Image Analysis:</strong> The app will analyze the uploaded image to determine its dimensions, aspect ratio, and megapixels.</li>
              <li><strong>Select DPI:</strong> Choose a DPI (Dots Per Inch) setting. Higher DPI generally means better print quality. You can select from standard (150 DPI), high (300 DPI), or ultra-high (600 DPI).</li>
              <li><strong>Select Poster Size:</strong> Choose a predefined poster size or select 'Custom' to enter your own dimensions. You can switch between inches and centimeters for custom sizes.</li>
              <li><strong>View Results:</strong> The app will calculate and display the effective DPI, print size, and print quality based on your selections. It will also indicate whether the image is suitable for poster printing.</li>
              <li><strong>Reset:</strong> Click the reset button to clear the current analysis and start over with a new image.</li>
            </ol>
            <p>By following these steps, you can easily determine if your image is suitable for printing as a poster and ensure the best possible print quality.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PosterPrintChecker;

const COMMON_SIZES = [
  { name: '18" x 24"', width: 18, height: 24 },
  { name: '24" x 36"', width: 24, height: 36 },
  { name: '27" x 40"', width: 27, height: 40 },
  { name: '30" x 40"', width: 30, height: 40 },
  { name: '36" x 48"', width: 36, height: 48 },
].map(size => ({
  ...size,
  widthCm: Math.round(size.width * 2.54),
  heightCm: Math.round(size.height * 2.54)
}));