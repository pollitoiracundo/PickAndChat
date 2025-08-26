// Script to generate extension icons
const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
function createSVGIcon(size) {
    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="4" fill="#1a73e8"/>
  <circle cx="${size/2}" cy="${size/2 - size*0.1}" r="${size*0.2}" fill="white"/>
  <rect x="${size*0.3}" y="${size*0.55}" width="${size*0.4}" height="${size*0.15}" rx="2" fill="white"/>
  <rect x="${size*0.25}" y="${size*0.75}" width="${size*0.5}" height="${size*0.1}" rx="1" fill="white"/>
</svg>`;
}

// Convert SVG to data URL for HTML canvas rendering
function svgToDataURL(svg) {
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// This would need to be run in a browser environment or with a library like sharp
// For now, let's create the SVG files that can be converted manually or with online tools

const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, 'icons');

if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

sizes.forEach(size => {
    const svg = createSVGIcon(size);
    fs.writeFileSync(path.join(iconsDir, `icon${size}.svg`), svg);
});

console.log('SVG icons created. Convert them to PNG using an online tool or image editor.');
console.log('Files created:', sizes.map(s => `icon${s}.svg`).join(', '));