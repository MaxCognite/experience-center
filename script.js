// Import Three.js modules
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// App state
const state = {
    items: 0,
    actions: 0,
    total: 0
};

// DOM elements
const actionBtn = document.getElementById('actionBtn');
const stat1 = document.getElementById('stat1');
const stat2 = document.getElementById('stat2');
const stat3 = document.getElementById('stat3');
const resetViewBtn = document.getElementById('resetViewBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const modelViewer = document.getElementById('modelViewer');

// 3D Scene variables
let scene, camera, renderer, controls, currentModel = null;

// Initialize the app
function init() {
    updateStats();
    setupEventListeners();
    init3DViewer();
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


// Handle button click
function handleAction() {
    state.items += Math.floor(Math.random() * 5) + 1;
    state.actions += 1;
    state.total = state.items + state.actions;
    
    updateStats();
    
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
}

// Load GLB/GLTF model from file path
function loadGLBModelFromPath(path) {
    const loader = new GLTFLoader();
    
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
        },
        (progress) => {
            // Progress tracking (silent)
        },
        (error) => {
            console.error('Error loading model:', error);
        }
    );
}

// Toggle fullscreen mode
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Enter fullscreen - request fullscreen on the document element
        const appContainer = document.querySelector('.app-container');
        
        if (appContainer.requestFullscreen) {
            appContainer.requestFullscreen().then(() => {
                fullscreenBtn.textContent = 'Exit Fullscreen';
                // Update renderer size when entering fullscreen
                setTimeout(() => {
                    onWindowResize();
                }, 100);
            }).catch(err => {
                console.error('Error entering fullscreen:', err);
            });
        } else if (appContainer.webkitRequestFullscreen) {
            // Safari support
            appContainer.webkitRequestFullscreen();
            fullscreenBtn.textContent = 'Exit Fullscreen';
            setTimeout(() => {
                onWindowResize();
            }, 100);
        } else if (appContainer.msRequestFullscreen) {
            // IE/Edge support
            appContainer.msRequestFullscreen();
            fullscreenBtn.textContent = 'Exit Fullscreen';
            setTimeout(() => {
                onWindowResize();
            }, 100);
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
                fullscreenBtn.textContent = 'Fullscreen';
                setTimeout(() => {
                    onWindowResize();
                }, 100);
            });
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
            fullscreenBtn.textContent = 'Fullscreen';
            setTimeout(() => {
                onWindowResize();
            }, 100);
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
            fullscreenBtn.textContent = 'Fullscreen';
            setTimeout(() => {
                onWindowResize();
            }, 100);
        }
    }
}

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        // Entered fullscreen
        setTimeout(() => {
            onWindowResize();
        }, 100);
    } else {
        // Exited fullscreen
        fullscreenBtn.textContent = 'Fullscreen';
        setTimeout(() => {
            onWindowResize();
        }, 100);
    }
});

document.addEventListener('webkitfullscreenchange', () => {
    if (document.webkitFullscreenElement) {
        // Entered fullscreen
        setTimeout(() => {
            onWindowResize();
        }, 100);
    } else {
        // Exited fullscreen
        fullscreenBtn.textContent = 'Fullscreen';
        setTimeout(() => {
            onWindowResize();
        }, 100);
    }
});

document.addEventListener('msfullscreenchange', () => {
    if (document.msFullscreenElement) {
        // Entered fullscreen
        setTimeout(() => {
            onWindowResize();
        }, 100);
    } else {
        // Exited fullscreen
        fullscreenBtn.textContent = 'Fullscreen';
        setTimeout(() => {
            onWindowResize();
        }, 100);
    }
});

// Reset camera view
function resetCamera() {
    if (currentModel) {
        const box = new THREE.Box3().setFromObject(currentModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        camera.position.set(0, 0, maxDim * 2);
        camera.lookAt(0, 0, 0);
        
        controls.target.set(0, 0, 0);
        controls.update();
    } else {
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();
    }
}

// Handle window resize
function onWindowResize() {
    const width = modelViewer.clientWidth;
    const height = modelViewer.clientHeight;
    
    if (width > 0 && height > 0) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
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
