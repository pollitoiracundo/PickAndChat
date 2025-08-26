# Pick and Chat Chrome Extension

A Chrome extension that allows users to select any DOM element from a webpage and send its content to ChatGPT for further interaction.

## Features

- Toggle extension on/off via toolbar button
- Hover over elements to highlight them
- Right-click highlighted elements to send to ChatGPT
- Automatically strips HTML tags and preserves text formatting
- Opens ChatGPT in a new window with the selected content

## Installation

1. Clone this repository
2. Generate PNG icons by opening `create_png_icons.html` in your browser and downloading the icons to the `icons/` folder
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select this project folder
6. The extension should now appear in your toolbar

## Usage

1. Click the extension icon in the Chrome toolbar
2. Click "Enable" to activate the extension
3. Navigate to any webpage
4. Hover over elements to see them highlighted
5. Right-click on a highlighted element
6. Select "Send to ChatGPT" from the context menu
7. A new window will open with ChatGPT and your selected content

## Files Structure

- `manifest.json` - Extension configuration
- `popup.html/css/js` - Extension popup interface
- `background.js` - Background service worker
- `content.js/css` - Content script for DOM interaction
- `icons/` - Extension icon files
- `create_png_icons.html` - Icon generation utility

## Development

The extension is built using Manifest V3 and vanilla JavaScript. No external dependencies are required.

## License

MIT License