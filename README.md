# Experience Center

A modern web application optimized for large vertical displays (1080x1920 portrait orientation) featuring an interactive 3D model viewer.

## Features

- **3D Model Viewer**: Display and interact with .glb/.gltf files using Three.js
- **Auto-rotation**: Models slowly rotate automatically
- **Fullscreen Mode**: Optimized 1080x1920 fullscreen viewing
- **Interactive Controls**: Rotate, zoom, and pan with mouse/touch
- **Modern UI**: Dark theme with smooth animations

## Usage

1. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)
2. The 3D model (`foo.glb`) loads automatically
3. Use mouse/touch to interact:
   - **Rotate**: Click and drag
   - **Zoom**: Scroll or pinch
   - **Pan**: Right-click and drag
4. Click "Fullscreen" for immersive viewing
5. Press "Reset View" to return to default camera position

## Technical Details

- **Three.js**: 3D rendering library
- **Vanilla JavaScript**: No frameworks required
- **ES Modules**: Modern JavaScript module system
- **Responsive**: Adapts to different screen sizes while maintaining portrait optimization

## Browser Requirements

- Modern browser with ES module support
- WebGL support for 3D rendering
- Recommended: Chrome 89+, Edge 89+, Safari 16.4+, Firefox 108+

## File Structure

```
experience-center/
├── index.html      # Main HTML file
├── style.css       # Styling
├── script.js       # Application logic and 3D viewer
├── foo.glb         # 3D model file
└── README.md       # This file
```

## Deployment

This app can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

For GitHub Pages, simply enable it in your repository settings and point to the root directory.
