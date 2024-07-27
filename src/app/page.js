"use client";

import React, { useState } from 'react';
import Head from 'next/head';
import { Helmet } from 'react-helmet';
import '../styles/PosterPrintChecker.css';

const PosterPrintChecker = () => {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [customSize, setCustomSize] = useState({ width: '', height: '' });
  const [customResult, setCustomResult] = useState(null);
  const [error, setError] = useState({ width: '', height: '' });

  const COMMON_SIZES = [
    { name: '18x24 inches', width: 18, height: 24 },
    { name: '24x36 inches', width: 24, height: 36 },
    { name: '36x48 inches', width: 36, height: 48 },
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage({
          file: file,
          width: img.width,
          height: img.height,
          src: e.target.result
        });
        analyzeImage(img.width, img.height);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = (width, height) => {
    const results = COMMON_SIZES.map(size => {
      const dpi = Math.min(width / size.width, height / size.height);
      let grade, explanation;

      if (dpi >= 300) {
        grade = 'Excellent';
        explanation = 'The image resolution is perfect for this size.';
      } else if (dpi >= 200) {
        grade = 'Good';
        explanation = 'The image should print well at this size.';
      } else if (dpi >= 150) {
        grade = 'Fair';
        explanation = 'The image may appear slightly pixelated at this size.';
      } else {
        grade = 'Poor';
        explanation = 'The image resolution is too low for this size. It will appear pixelated.';
      }

      return { size: size.name, grade, explanation, dpi: Math.round(dpi) };
    });

    setAnalysis(results);
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'Excellent': return 'rgba(76, 175, 80, 0.6)';
      case 'Good': return 'rgba(139, 195, 74, 0.6)';
      case 'Fair': return 'rgba(255, 193, 7, 0.6)';
      case 'Poor': return 'rgba(244, 67, 54, 0.6)';
      default: return 'rgba(158, 158, 158, 0.6)';
    }
  };

  const handleCustomSizeChange = (e) => {
    const { name, value } = e.target;
    setCustomSize(prev => ({ ...prev, [name]: value }));
  };

  const analyzeCustomSize = () => {
    if (!image || !customSize.width || !customSize.height) {
      setError({ width: 'Required', height: 'Required' });
      return;
    }

    const dpi = Math.min(image.width / customSize.width, image.height / customSize.height);
    let grade, explanation;

    if (dpi >= 300) {
      grade = 'Excellent';
      explanation = 'The image resolution is perfect for this size.';
    } else if (dpi >= 200) {
      grade = 'Good';
      explanation = 'The image should print well at this size.';
    } else if (dpi >= 150) {
      grade = 'Fair';
      explanation = 'The image may appear slightly pixelated at this size.';
    } else {
      grade = 'Poor';
      explanation = 'The image resolution is too low for this size. It will appear pixelated.';
    }

    setCustomResult({ size: `${customSize.width}x${customSize.height} inches`, grade, explanation, dpi: Math.round(dpi) });
    document.querySelector('.custom-size').classList.add('analyzed');
  };

  const resetCustomSize = () => {
    setCustomSize({ width: '', height: '' });
    setCustomResult(null);
    document.querySelector('.custom-size').classList.remove('analyzed');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numValue = Number(value);
    
    if (numValue <= 0) {
      setError(prev => ({ ...prev, [name]: 'Value must be greater than 0' }));
      setCustomSize(prev => ({ ...prev, [name]: '' }));
    } else {
      setError(prev => ({ ...prev, [name]: '' }));
      setCustomSize(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleIncrement = (name) => {
    setCustomSize(prev => {
      const newValue = Number(prev[name] || 0) + 1;
      setError(prevError => ({ ...prevError, [name]: '' }));
      return { ...prev, [name]: String(newValue) };
    });
  };

  const handleDecrement = (name) => {
    setCustomSize(prev => {
      const newValue = Math.max(1, Number(prev[name] || 0) - 1);
      if (newValue === 1) {
        setError(prevError => ({ ...prevError, [name]: 'Minimum value is 1' }));
      } else {
        setError(prevError => ({ ...prevError, [name]: '' }));
      }
      return { ...prev, [name]: String(newValue) };
    });
  };

  return (
    <>
      <Head>
        <title>Poster Print Checker</title>
        <meta name="description" content="Check if your image is suitable for poster printing" />
      </Head>
      <Helmet>
        <title>Poster Print Checker</title>
        <meta name="description" content="Check if your image is suitable for poster printing" />
      </Helmet>
      <nav className="navbar">
        <div className="navbar-container">
          <h1 className="navbar-title">Poster Print Checker</h1>
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
            <h2>Check Your Image for Poster Printing</h2>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {image && (
              <div>
                <h3>Uploaded Image</h3>
                <p>Dimensions: {image.width} x {image.height} pixels</p>
              </div>
            )}
            {analysis && (
              <div className="results-grid">
                {analysis.map((result, index) => (
                  <div 
                    key={index} 
                    className="poster-result"
                    style={{backgroundImage: `url(${image.src})`, backgroundSize: 'cover', backgroundPosition: 'center'}}
                  >
                    <div className="poster-overlay" style={{backgroundColor: getGradeColor(result.grade)}}>
                      <div className="poster-front">
                        <h4>{result.size}</h4>
                        <p>{result.grade}</p>
                      </div>
                      <div className="poster-back">
                        <h4>{result.size}</h4>
                        <p>Grade: {result.grade}</p>
                        <p>DPI: {result.dpi}</p>
                        <p>{result.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="poster-result custom-size">
                  <div 
                    className={`poster-overlay ${customResult ? 'analyzed' : ''}`} 
                    style={{
                      backgroundImage: customResult ? `url(${image.src})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div 
                      className="grade-background"
                      style={{
                        backgroundColor: customResult ? getGradeColor(customResult.grade) : 'transparent'
                      }}
                    ></div>
                    <div className="poster-front">
                      {!customResult ? (
                        <>
                          <h4>Custom Size</h4>
                          <div className="custom-size-inputs">
                            <div className="input-group">
                              <input 
                                type="number" 
                                name="width" 
                                value={customSize.width} 
                                onChange={handleInputChange} 
                                placeholder="Width"
                                min="1"
                              />
                              <span className="input-label">in</span>
                              <div className="input-arrows">
                                <button className="arrow-up" onClick={() => handleIncrement('width')}>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                    <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
                                  </svg>
                                </button>
                                <button className="arrow-down" onClick={() => handleDecrement('width')}>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
                                  </svg>
                                </button>
                              </div>
                              {error.width && <span className="error-message">{error.width}</span>}
                            </div>
                            <div className="input-group">
                              <input 
                                type="number" 
                                name="height" 
                                value={customSize.height} 
                                onChange={handleInputChange} 
                                placeholder="Height"
                                min="1"
                              />
                              <span className="input-label">in</span>
                              <div className="input-arrows">
                                <button className="arrow-up" onClick={() => handleIncrement('height')}>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                    <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
                                  </svg>
                                </button>
                                <button className="arrow-down" onClick={() => handleDecrement('height')}>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
                                  </svg>
                                </button>
                              </div>
                              {error.height && <span className="error-message">{error.height}</span>}
                            </div>
                            <button onClick={analyzeCustomSize} className="btn-analyze">Analyze</button>
                          </div>
                        </>
                      ) : (
                        <div className="custom-size-result">
                          <h4>{customResult.size}</h4>
                          <p className="grade">{customResult.grade}</p>
                        </div>
                      )}
                    </div>
                    {customResult && (
                      <div className="poster-back">
                        <h4>{customResult.size}</h4>
                        <p>Grade: {customResult.grade}</p>
                        <p>DPI: {customResult.dpi}</p>
                        <p>{customResult.explanation}</p>
                      </div>
                    )}
                    {customResult && (
                      <button onClick={resetCustomSize} className="btn-reset">New Size</button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="explenation-container">
            <h2>How It Works</h2>
            <p>Upload an image to check if it's suitable for printing at common poster sizes. We analyze the image resolution and provide a grade for each size, along with an explanation.</p>
            <p>The grades are based on the resulting DPI (Dots Per Inch) when the image is printed at each size:</p>
            <ul>
              <li>Excellent: 300 DPI or higher</li>
              <li>Good: 200-299 DPI</li>
              <li>Fair: 150-199 DPI</li>
              <li>Poor: Below 150 DPI</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default PosterPrintChecker;