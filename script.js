// Import Three.js modules
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// App state
const state = {
    items: 0,
    actions: 0,
    total: 0,
    activities: ['App initialized']
};

// DOM elements
const actionBtn = document.getElementById('actionBtn');
const stat1 = document.getElementById('stat1');
const stat2 = document.getElementById('stat2');
const stat3 = document.getElementById('stat3');
const activityList = document.getElementById('activityList');
const resetViewBtn = document.getElementById('resetViewBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const modelViewer = document.getElementById('modelViewer');

// 3D Scene variables
let scene, camera, renderer, controls, currentModel = null;

// Initialize the app
function init() {
    updateStats();
    renderActivities();
    setupEventListeners();
    init3DViewer();
    addActivity('App ready');
}

// Update statistics display
function updateStats() {
    stat1.textContent = state.items;
    stat2.textContent = state.actions;
    stat3.textContent = state.total;
    
    // Add animation
    [stat1, stat2, stat3].forEach(stat => {
        stat.style.transform = 'scale(1.2)';
        setTimeout(() => {
            stat.style.transform = 'scale(1)';
        }, 200);
    });
}

// Add activity to the feed
function addActivity(message) {
    const timestamp = new Date().toLocaleTimeString();
    state.activities.unshift(`[${timestamp}] ${message}`);
    
    // Keep only last 10 activities
    if (state.activities.length > 10) {
        state.activities.pop();
    }
    
    renderActivities();
}

// Render activities list
function renderActivities() {
    activityList.innerHTML = state.activities
        .map(activity => `<div class="activity-item">${activity}</div>`)
        .join('');
}

// Handle button click
function handleAction() {
    state.items += Math.floor(Math.random() * 5) + 1;
    state.actions += 1;
    state.total = state.items + state.actions;
    
    updateStats();
    addActivity(`Action performed: +${state.items - (state.items - (Math.floor(Math.random() * 5) + 1))} items`);
    
    // Button animation
    actionBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        actionBtn.style.transform = 'scale(1)';
    }, 100);
}

// Setup event listeners
function setupEventListeners() {
    actionBtn.addEventListener('click', handleAction);
    
    // 3D Model controls
    resetViewBtn.addEventListener('click', resetCamera);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleAction();
        }
        if (e.key === 'f' || e.key === 'F') {
            toggleFullscreen();
        }
    });
    
    // Touch support for large displays
    actionBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleAction();
    });
}

// Initialize 3D viewer
function init3DViewer() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Black background
    
    // Camera setup
    const aspect = modelViewer.clientWidth / modelViewer.clientHeight;
    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    camera.position.set(0, 0, 5);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(modelViewer.clientWidth, modelViewer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    modelViewer.appendChild(renderer.domElement);
    
    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 20;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
    
    // Auto-load foo.glb
    loadGLBModelFromPath('foo.glb');
    
    addActivity('3D viewer initialized');
}

// Load GLB/GLTF model from file path
function loadGLBModelFromPath(path) {
    const loader = new GLTFLoader();
    
    addActivity(`Loading model: ${path}`);
    
    loader.load(
        path,
        (gltf) => {
            // Remove previous model if exists
            if (currentModel) {
                scene.remove(currentModel);
            }
            
            currentModel = gltf.scene;
            scene.add(currentModel);
            
            // Center and scale model
            const box = new THREE.Box3().setFromObject(currentModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Center the model
            currentModel.position.x = -center.x;
            currentModel.position.y = -center.y;
            currentModel.position.z = -center.z;
            
            // Scale to fit
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim;
            currentModel.scale.multiplyScalar(scale);
            
            // Reset camera
            resetCamera();
            
            addActivity(`Model loaded: ${path}`);
        },
        (progress) => {
            if (progress.total > 0) {
                const percent = (progress.loaded / progress.total * 100).toFixed(1);
                addActivity(`Loading: ${percent}%`);
            }
        },
        (error) => {
            console.error('Error loading model:', error);
            addActivity(`Error loading model: ${error.message}`);
        }
    );
}

// Toggle fullscreen mode
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Enter fullscreen
        const fullscreenContainer = document.createElement('div');
        fullscreenContainer.id = 'fullscreenContainer';
        fullscreenContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 1080px;
            height: 1920px;
            background: #000;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        `;
        
        const fullscreenViewer = document.createElement('div');
        fullscreenViewer.id = 'fullscreenViewer';
        fullscreenViewer.style.cssText = `
            width: 1080px;
            height: 1920px;
            position: relative;
        `;
        
        fullscreenContainer.appendChild(fullscreenViewer);
        document.body.appendChild(fullscreenContainer);
        
        // Create new renderer for fullscreen
        const fullscreenRenderer = new THREE.WebGLRenderer({ antialias: true });
        fullscreenRenderer.setSize(1080, 1920);
        fullscreenRenderer.setPixelRatio(window.devicePixelRatio);
        fullscreenViewer.appendChild(fullscreenRenderer.domElement);
        
        // Update camera aspect
        camera.aspect = 1080 / 1920;
        camera.updateProjectionMatrix();
        
        // Create fullscreen controls
        const fullscreenControls = new OrbitControls(camera, fullscreenRenderer.domElement);
        fullscreenControls.enableDamping = true;
        fullscreenControls.dampingFactor = 0.05;
        fullscreenControls.minDistance = 1;
        fullscreenControls.maxDistance = 20;
        fullscreenControls.target.copy(controls.target);
        fullscreenControls.update();
        
        // Store fullscreen state
        window.fullscreenState = {
            container: fullscreenContainer,
            renderer: fullscreenRenderer,
            controls: fullscreenControls,
            originalControls: controls,
            originalRenderer: renderer
        };
        
        // Animation loop for fullscreen
        function fullscreenAnimate() {
            if (window.fullscreenState) {
                requestAnimationFrame(fullscreenAnimate);
                
                // Slowly rotate the model if it exists
                if (currentModel) {
                    currentModel.rotation.y += 0.002; // Very slow rotation
                }
                
                fullscreenControls.update();
                fullscreenRenderer.render(scene, camera);
            }
        }
        fullscreenAnimate();
        
        // Exit fullscreen on ESC or click outside
        const exitFullscreen = () => {
            if (window.fullscreenState) {
                document.body.removeChild(window.fullscreenState.container);
                camera.aspect = modelViewer.clientWidth / modelViewer.clientHeight;
                camera.updateProjectionMatrix();
                controls = window.fullscreenState.originalControls;
                renderer = window.fullscreenState.originalRenderer;
                window.fullscreenState = null;
                animate(); // Restart original animation
            }
        };
        
        fullscreenContainer.addEventListener('click', (e) => {
            if (e.target === fullscreenContainer) {
                exitFullscreen();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && window.fullscreenState) {
                exitFullscreen();
            }
        }, { once: true });
        
        fullscreenBtn.textContent = 'Exit Fullscreen';
    } else {
        // Exit fullscreen (if using native fullscreen API)
        document.exitFullscreen();
    }
}

// Reset camera view
function resetCamera() {
    if (currentModel) {
        const box = new THREE.Box3().setFromObject(currentModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        camera.position.set(0, 0, maxDim * 2);
        camera.lookAt(0, 0, 0);
        
        // Update controls (handle both regular and fullscreen)
        const activeControls = window.fullscreenState ? window.fullscreenState.controls : controls;
        activeControls.target.set(0, 0, 0);
        activeControls.update();
    } else {
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);
        
        const activeControls = window.fullscreenState ? window.fullscreenState.controls : controls;
        activeControls.target.set(0, 0, 0);
        activeControls.update();
    }
}

// Handle window resize
function onWindowResize() {
    const width = modelViewer.clientWidth;
    const height = modelViewer.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Slowly rotate the model if it exists
    if (currentModel) {
        currentModel.rotation.y += 0.002; // Very slow rotation (about 1 full rotation per ~52 seconds)
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// Auto-update stats every 5 seconds (demo)
let autoUpdateInterval;
function startAutoUpdate() {
    autoUpdateInterval = setInterval(() => {
        if (Math.random() > 0.7) {
            state.items += Math.floor(Math.random() * 3);
            state.total = state.items + state.actions;
            updateStats();
            addActivity('Auto-update: Items increased');
        }
    }, 5000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Optional: Start auto-update (can be disabled)
// startAutoUpdate();
