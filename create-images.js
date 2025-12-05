const fs = require('fs');
const path = require('path');

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Simple colored PNG (1x1 pixel, repeated)
// This creates a proper colored rectangle image data

function createColoredImage(color, initials) {
  // Create a simple colored canvas using canvas library
  // For now, create data URIs as base64 PNG files
  
  const colors = {
    rishav: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAACE4AAAhOAHayrVTAAAAvElEQVR4nO3QQQEAAAggCB9S+RvkT6OMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIj7ASwBAAHpnkJhAAAAAElFTkSuQmCC', 'base64'),
    vinay: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAACE4AAAhOAHayrVTAAAAvElEQVR4nO3QQQEAAAggCB9S+RvkT6OMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIj7ASwBAAHpnkJhAAAAAElFTkSuQmCC', 'base64'),
    saurabh: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAACE4AAAhOAHayrVTAAAAvElEQVR4nO3QQQEAAAggCB9S+RvkT6OMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIgRI0aMGDFixIj7ASwBAAHpnkJhAAAAAElFTkSuQmCC', 'base64')
  };

  return colors[color];
}

// Write images
fs.writeFileSync(path.join(imagesDir, 'rishav.png'), createColoredImage('rishav'));
fs.writeFileSync(path.join(imagesDir, 'vinay.png'), createColoredImage('vinay'));
fs.writeFileSync(path.join(imagesDir, 'saurabh.png'), createColoredImage('saurabh'));

console.log('✓ Images created successfully in public/images/');
