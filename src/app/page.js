"use client";

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Helmet } from 'react-helmet';
import '../styles/PosterPrintChecker.css';
import ReactGA from 'react-ga4';

const PosterPrintChecker = () => {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedExplanation, setSelectedExplanation] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState(''); // Default color

  const COMMON_SIZES = [
    { name: '4x6"', width: 4, height: 6, description: 'Common photo size for albums' },
    { name: '5x7"', width: 5, height: 7, description: 'Common photo size for frames' },
    { name: 'A6', width: 4.1, height: 5.8, description: 'Postcard size' },
    { name: 'A5', width: 5.8, height: 8.3, description: 'Half of A4, used for notebooks' },
    { name: '8x10"', width: 8, height: 10, description: 'Standard photo size for portraits' },
    { name: 'A4', width: 8.3, height: 11.7, description: 'Standard letter size paper' },
    { name: 'A3', width: 11.7, height: 16.5, description: 'Used for posters and drawings' },
    { name: '11x14"', width: 11, height: 14, description: 'Common print size for photos' },
    { name: '12x18"', width: 12, height: 18, description: 'Common poster size' },
    { name: 'A2', width: 16.5, height: 23.4, description: 'Used for large posters' },
    { name: '16x20"', width: 16, height: 20, description: 'Common size for wall art' },
    { name: '16x24"', width: 16, height: 24, description: 'Common poster size' },
    { name: '18x24"', width: 18, height: 24, description: 'Used for movie posters' },
    { name: '20x30"', width: 20, height: 30, description: 'Large poster size' },
    { name: 'A1', width: 23.4, height: 33.1, description: 'Used for large prints and posters' },
    { name: '24x30"', width: 24, height: 30, description: 'Common print size for art' },
    { name: '24x36"', width: 24, height: 36, description: 'Standard movie poster size' },
    { name: 'A0', width: 33.1, height: 46.8, description: 'Used for large format prints' },
    { name: '30x40"', width: 30, height: 40, description: 'Large wall photo size' },
    { name: '30x60"', width: 30, height: 60, description: 'Common banner size' },
    { name: '36x48"', width: 36, height: 48, description: 'Large poster size' },
    { name: '48x72"', width: 48, height: 72, description: 'Extra large poster size' },
  ];

  useEffect(() => {
    ReactGA.initialize('G-P35QPLTGWT'); // Replace with your actual GA4 Measurement ID
  }, []);

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

        // Send event to Google Analytics
        ReactGA.event({
          category: 'User Interaction',
          action: 'Image Upload',
          label: file.name,
        });
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

  const getGradeColor = (dpi) => {
    if (dpi > 300) {
      return '#02EC88'; // Softer Green
    } else if (dpi >= 150 && dpi <= 300) {
      return '#E6Ca51'; // Softer Yellow
    } else {
      return '#E53529'; // Softer Red
    }
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
              <div className="results-container" style={{ display: 'flex', alignItems: 'stretch', flexDirection: 'column' }}>
                <h3 style={{ textAlign: 'center' }}>Uploaded Image</h3>
                <p style={{ textAlign: 'center' }}>Dimensions: {image.width} x {image.height} pixels</p>
                <div style={{ display: 'flex', width: '100%' }}>
                  <div className="image-display" style={{ flex: '1', marginRight: '20px' }}>
                    <div 
                      className="poster-result"
                      style={{backgroundImage: `url(${image.src})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '200px', width: '200px'}}
                    >
                      <div className="poster-overlay" style={{ backgroundColor: backgroundColor }}>
                        <div className="poster-front" style={{ height: '100%', width: '100%', position: 'relative' }}>
                          <img 
                            src={image.src} 
                            alt="Uploaded" 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover', 
                              borderRadius: '4px'
                            }} 
                          />
                          {selectedSize ? (
                            <>
                              <h4 style={{ position: 'absolute', bottom: '10px', left: '10px', color: '#fff' }}>{selectedSize}</h4>
                              <p style={{ position: 'absolute', bottom: '30px', left: '10px', color: '#fff' }}>{selectedGrade}</p>
                            </>
                          ) : (
                            <p style={{ position: 'absolute', bottom: '10px', left: '10px', color: '#fff' }}>Select a size</p>
                          )}
                        </div>
                        <div className="poster-back">
                          <h4>{selectedSize || analysis[0]?.size}</h4>
                          <p>Grade: {selectedGrade || analysis[0]?.grade}</p>
                          <p>
                            DPI: {selectedSize ? Math.min(image.width / COMMON_SIZES.find(size => size.name === selectedSize).width, image.height / COMMON_SIZES.find(size => size.name === selectedSize).height).toFixed(2) : analysis[0]?.dpi}
                          </p>
                          <p>{selectedExplanation || analysis[0]?.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="results-info" style={{ flex: '1', height: '200px', border: '1px solid #ccc', overflow: 'hidden', borderRadius: '8px', padding: '10px' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Choose Your Preferred Print Size</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', overflowY: 'auto', maxHeight: '150px', padding: '5px' }}>
                      {analysis && analysis.map((result, index) => (
                        <div 
                          key={index} 
                          style={{ width: '40px', height: '30px', backgroundColor: getGradeColor(result.dpi), display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', cursor: 'pointer' }} 
                          title={COMMON_SIZES.find(size => size.name === result.size)?.description} // Tooltip with description
                          onClick={() => {
                            setSelectedSize(result.size);
                            setSelectedGrade(result.grade);
                            setSelectedExplanation(result.explanation);
                            setBackgroundColor(getGradeColor(result.dpi)); // Set background color based on DPI
                          }}
                        >
                          <span style={{ color: '#fff', fontSize: '10px' }}>{result.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="explenation-container">
            <h2>Transform Online Images into High-Quality Prints</h2>
            <p>Use Print Size Calculator to make any image online into a high-quality poster or album photo. This powerful tool analyzes your digital images and determines the optimal print dimensions, ensuring stunning results whether you're creating wall art or preserving memories in a photo album.</p>
            <h3>Key features:</h3>
            <ul>
              <li>Works with any online image</li>
              <li>Calculates ideal sizes for posters and photos</li>
              <li>Ensures high-quality prints every time</li>
              <li>Easy to use: just upload and get results</li>
            </ul>
            <p>Don't let great online images stay trapped on your screen. With Print Size Calculator, transform them into beautiful, tangible prints that you can enjoy in the real world. Whether you're a professional photographer, a social media enthusiast, or just looking to decorate your space, this tool helps you achieve professional-grade prints from your digital files.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PosterPrintChecker;