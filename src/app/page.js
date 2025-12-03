'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Head from 'next/head'
import { Helmet } from 'react-helmet'
import '../styles/PosterPrintChecker.css'
import ReactGA from 'react-ga4'
import { Upload, Link, ChevronDown, Plus } from 'lucide-react'

const ModernHeader = ({ onImageUpload }) => {
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const fileInputRef = useRef(null)
  const urlInputRef = useRef(null)
  const urlButtonRef = useRef(null)

  const handleFileUpload = useCallback(
    file => {
      const reader = new FileReader()
      reader.onload = e => {
        const img = new Image()
        img.onload = () => {
          onImageUpload({
            file: file,
            width: img.width,
            height: img.height,
            src: e.target.result,
          })
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    },
    [onImageUpload]
  )

  const handleFileInputChange = useCallback(
    e => {
      if (e.target.files && e.target.files[0]) {
        handleFileUpload(e.target.files[0])
      }
    },
    [handleFileUpload]
  )

  const handleUrlSubmit = useCallback(
    e => {
      e.preventDefault()
      if (imageUrl) {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          canvas.toBlob(blob => {
            const file = new File([blob], 'image.jpg', { type: 'image/jpeg' })
            onImageUpload({
              file: file,
              width: img.width,
              height: img.height,
              src: imageUrl,
            })
          }, 'image/jpeg')
        }
        img.onerror = () => {
          console.error('Error loading image from URL')
          // You might want to show an error message to the user here
        }
        img.src = imageUrl
      }
      setShowUrlInput(false)
      setImageUrl('')
    },
    [imageUrl, onImageUpload]
  )

  return (
    <header className="modern-header">
      <div className="modern-header-container">
        <div className="header-content">
          <h1>Print Size Calculator</h1>
          <p>Transform Online Images into High-Quality adam Prints</p>
        </div>

        <div className="button-container">
          <div
            className="upload-button"
            onClick={() => fileInputRef.current.click()}
          >
            <Upload size={20} className="icon" />
            <span>Drag or Upload Image</span>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden-input"
              onChange={handleFileInputChange}
            />
          </div>

          <div className="url-input-container">
            <button
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="url-button"
            >
              <Link size={20} className="icon" />
              <span>Enter URL</span>
              <ChevronDown size={20} className="chev-icon" />
            </button>

            {showUrlInput && (
              <form onSubmit={handleUrlSubmit} className="url-form">
                <input
                  type="url"
                  placeholder="Paste image URL here"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="url-input"
                />
                <button type="submit" className="submit-button">
                  Submit
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

const getGradeColor = dpi => {
  if (dpi > 300) {
    return '#4F46E5' // Indigo-600
  } else if (dpi >= 200) {
    return '#6366F1' // Indigo-500
  } else if (dpi >= 150) {
    return '#818CF8' // Indigo-400
  } else {
    return '#A5B4FC' // Indigo-300
  }
}

const getGradeText = dpi => {
  if (dpi > 300) {
    return 'Excellent'
  } else if (dpi >= 200) {
    return 'Good'
  } else if (dpi >= 150) {
    return 'Fair'
  } else {
    return 'Poor'
  }
}

const GradeLegend = () => (
  <div className="grade-legend">
    <h4>Print Quality Legend</h4>
    <div className="legend-items">
      {[
        { dpi: 301, label: 'Excellent (300+ DPI)' },
        { dpi: 200, label: 'Good (200-300 DPI)' },
        { dpi: 150, label: 'Fair (150-199 DPI)' },
        { dpi: 149, label: 'Poor (Below 150 DPI)' },
      ].map((item, index) => (
        <div key={index} className="legend-item">
          <span
            className="color-swatch"
            style={{ backgroundColor: getGradeColor(item.dpi) }}
          ></span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  </div>
)

const CustomSizeInput = ({ onCustomSizeSubmit }) => {
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [unit, setUnit] = useState('in') // 'in' for inches, 'cm' for centimeters

  const handleInputChange = setter => e => {
    const value = e.target.value
    if (value === '' || /^[1-9]\d*$/.test(value)) {
      setter(value)
    }
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (width && height) {
      onCustomSizeSubmit(parseInt(width, 10), parseInt(height, 10), unit)
      setShowInput(false)
      setWidth('')
      setHeight('')
    }
  }

  const toggleUnit = () => {
    setUnit(prevUnit => (prevUnit === 'in' ? 'cm' : 'in'))
  }

  return (
    <div className="custom-size-container">
      {!showInput ? (
        <button
          className="custom-size-button"
          onClick={() => setShowInput(true)}
        >
          <Plus size={20} />
          <span>Custom Size</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="custom-size-form">
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Width"
              value={width}
              onChange={handleInputChange(setWidth)}
              required
            />
          </div>
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Height"
              value={height}
              onChange={handleInputChange(setHeight)}
              required
            />
          </div>
          <button type="button" onClick={toggleUnit} className="unit-toggle">
            {unit}
          </button>
          <button type="submit">Add</button>
          <button type="button" onClick={() => setShowInput(false)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  )
}

const PosterPrintChecker = () => {
  const [image, setImage] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [selectedExplanation, setSelectedExplanation] = useState(null)
  const [backgroundColor, setBackgroundColor] = useState('') // Default color
  const [customSizes, setCustomSizes] = useState([])

  const COMMON_SIZES = [
    {
      name: '4x6',
      width: 4,
      height: 6,
      description: 'Common photo size for albums',
    },
    {
      name: '5x7',
      width: 5,
      height: 7,
      description: 'Common photo size for frames',
    },
    { name: 'A6', width: 4.1, height: 5.8, description: 'Postcard size' },
    {
      name: 'A5',
      width: 5.8,
      height: 8.3,
      description: 'Half of A4, used for notebooks',
    },
    {
      name: '8x10',
      width: 8,
      height: 10,
      description: 'Standard photo size for portraits',
    },
    {
      name: 'A4',
      width: 8.3,
      height: 11.7,
      description: 'Standard letter size paper',
    },
    {
      name: 'A3',
      width: 11.7,
      height: 16.5,
      description: 'Used for posters and drawings',
    },
    {
      name: '11x14',
      width: 11,
      height: 14,
      description: 'Common print size for photos',
    },
    { name: '12x18', width: 12, height: 18, description: 'Common poster size' },
    {
      name: 'A2',
      width: 16.5,
      height: 23.4,
      description: 'Used for large posters',
    },
    {
      name: '16x20',
      width: 16,
      height: 20,
      description: 'Common size for wall art',
    },
    { name: '16x24', width: 16, height: 24, description: 'Common poster size' },
    {
      name: '18x24',
      width: 18,
      height: 24,
      description: 'Used for movie posters',
    },
    { name: '20x30', width: 20, height: 30, description: 'Large poster size' },
    {
      name: 'A1',
      width: 23.4,
      height: 33.1,
      description: 'Used for large prints and posters',
    },
    {
      name: '24x30',
      width: 24,
      height: 30,
      description: 'Common print size for art',
    },
    {
      name: '24x36',
      width: 24,
      height: 36,
      description: 'Standard movie poster size',
    },
    {
      name: 'A0',
      width: 33.1,
      height: 46.8,
      description: 'Used for large format prints',
    },
    {
      name: '30x40',
      width: 30,
      height: 40,
      description: 'Large wall photo size',
    },
    { name: '30x60', width: 30, height: 60, description: 'Common banner size' },
    { name: '36x48', width: 36, height: 48, description: 'Large poster size' },
    {
      name: '48x72',
      width: 48,
      height: 72,
      description: 'Extra large poster size',
    },
  ]

  useEffect(() => {
    ReactGA.initialize('G-P35QPLTGWT') // Replace with your actual GA4 Measurement ID
  }, [])

  const handleImageUpload = useCallback(imageData => {
    setImage(imageData)
    analyzeImage(imageData.width, imageData.height)

    // Send event to Google Analytics
    ReactGA.event({
      category: 'User Interaction',
      action: 'Image Upload',
      label: imageData.file.name,
    })
  }, [])

  const handleCustomSizeSubmit = (width, height, unit) => {
    let widthInInches, heightInInches

    if (unit === 'cm') {
      widthInInches = Math.round(width / 2.54)
      heightInInches = Math.round(height / 2.54)
    } else {
      widthInInches = width
      heightInInches = height
    }

    const newSize = {
      name: `${width}x${height}`,
      width: widthInInches,
      height: heightInInches,
      description: 'Custom size',
      unit: unit,
    }
    setCustomSizes([...customSizes, newSize])
    analyzeImage(image.width, image.height, [
      ...COMMON_SIZES,
      ...customSizes,
      newSize,
    ])
  }

  const analyzeImage = (
    width,
    height,
    sizes = [...COMMON_SIZES, ...customSizes]
  ) => {
    const results = sizes.map(size => {
      const dpi = Math.min(width / size.width, height / size.height)
      let grade, explanation

      if (dpi >= 300) {
        grade = 'Excellent'
        explanation = 'The image resolution is perfect for this size.'
      } else if (dpi >= 200) {
        grade = 'Good'
        explanation = 'The image should print well at this size.'
      } else if (dpi >= 150) {
        grade = 'Fair'
        explanation = 'The image may appear slightly pixelated at this size.'
      } else {
        grade = 'Poor'
        explanation =
          'The image resolution is too low for this size. It will appear pixelated.'
      }

      return { size: size.name, grade, explanation, dpi: Math.round(dpi) }
    })

    setAnalysis(results)
  }

  const handleDrop = useCallback(
    e => {
      e.preventDefault()
      e.stopPropagation()
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0]
        const reader = new FileReader()
        reader.onload = e => {
          const img = new Image()
          img.onload = () => {
            handleImageUpload({
              file: file,
              width: img.width,
              height: img.height,
              src: e.target.result,
            })
          }
          img.src = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    [handleImageUpload]
  )

  const handleDragOver = useCallback(e => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  useEffect(() => {
    document.addEventListener('drop', handleDrop)
    document.addEventListener('dragover', handleDragOver)
    return () => {
      document.removeEventListener('drop', handleDrop)
      document.removeEventListener('dragover', handleDragOver)
    }
  }, [handleDrop, handleDragOver])

  return (
    <>
      <Head>
        <title>Poster Print Checker</title>
        <meta
          name="description"
          content="Check if your image is suitable for poster printing"
        />
      </Head>
      <Helmet>
        <title>Poster Print Checker</title>
        <meta
          name="description"
          content="Check if your image is suitable for poster printing"
        />
      </Helmet>
      <ModernHeader onImageUpload={handleImageUpload} />
      <div className="container">
        <div className="main-container">
          <div className={`calc-container ${image ? 'visible' : ''}`}>
            <h2>Analysis Results</h2>
            {image && (
              <div className="results-container">
                <div className="image-preview">
                  <h3>Uploaded Image</h3>
                  <p>
                    Dimensions: {image.width} x {image.height} pixels
                  </p>
                  <div className="image-display">
                    <img src={image.src} alt="Uploaded image" />
                    <div
                      className="image-overlay"
                      style={{ backgroundColor: backgroundColor }}
                    >
                      {selectedSize ? (
                        <>
                          <h4>{selectedSize}</h4>
                          <p>{selectedGrade}</p>
                        </>
                      ) : (
                        <p>Select a size</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="size-selector">
                  <h3>Choose Your Preferred Print Size</h3>
                  <div className="size-grid">
                    {analysis &&
                      analysis.map((result, index) => {
                        const sizeInfo = [...COMMON_SIZES, ...customSizes].find(
                          size => size.name === result.size
                        )
                        return (
                          <button
                            key={index}
                            className={`size-option ${
                              selectedSize === result.size ? 'selected' : ''
                            }`}
                            style={{
                              backgroundColor: getGradeColor(result.dpi),
                            }}
                            onClick={() => {
                              setSelectedSize(result.size)
                              setSelectedGrade(getGradeText(result.dpi))
                              setSelectedExplanation(result.explanation)
                              setBackgroundColor(getGradeColor(result.dpi))
                            }}
                            title={sizeInfo?.description}
                            data-unit={sizeInfo?.unit || 'in'}
                          >
                            {result.size}
                          </button>
                        )
                      })}
                  </div>
                  <CustomSizeInput
                    onCustomSizeSubmit={handleCustomSizeSubmit}
                  />
                </div>
                <GradeLegend />
                {selectedSize && (
                  <div className="size-details">
                    <h3>Print Details</h3>
                    <p>
                      <strong>Size:</strong> {selectedSize}
                    </p>
                    <p>
                      <strong>Grade:</strong> {selectedGrade}
                    </p>
                    <p>
                      <strong>DPI:</strong>{' '}
                      {analysis.find(a => a.size === selectedSize)?.dpi}
                    </p>
                    <p>{selectedExplanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="explenation-container">
            <h2>Transform Online Images into High-Quality Prints</h2>
            <p>
              Use Print Size Calculator to make any image online into a
              high-quality poster or album photo. This powerful tool analyzes
              your digital images and determines the optimal print dimensions,
              ensuring stunning results whether you're creating wall art or
              preserving memories in a photo album.
            </p>
            <h3>Key features:</h3>
            <ul>
              <li>Works with any online image</li>
              <li>Calculates ideal sizes for posters and photos</li>
              <li>Ensures high-quality prints every time</li>
              <li>Easy to use: just upload and get results</li>
            </ul>
            <p>
              Don't let great online images stay trapped on your screen. With
              Print Size Calculator, transform them into beautiful, tangible
              prints that you can enjoy in the real world. Whether you're a
              professional photographer, a social media enthusiast, or just
              looking to decorate your space, this tool helps you achieve
              professional-grade prints from your digital files.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default PosterPrintChecker
