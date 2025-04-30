// Entry point for the modularized star map app
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'; // Add CSS3DObject import
import { pois, STAR_COUNT, SCROLL_DAMPING, MAX_SCROLL_SPEED } from './config.js';
import { scene, camera, renderer, viewportWidth, viewportHeight, getViewportHeight, getViewportWidth } from './sceneSetup.js';
import { createAllStars, updateStars } from './stars.js';
import { createAllPOIs, createConnectingLines, updatePOIs } from './poi.js';
import { setupMouseMoveHandler, setupScrollHandler, setupResizeHandler, setupClickHandler, mouseWorldPosition, scrollState, raycaster, currentInfoBox } from './interaction.js'; // Import currentInfoBox

// --- CSS3DRenderer only for overlays and header/footer ---
const appContainer = document.getElementById('app-container');
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0px';
cssRenderer.domElement.style.pointerEvents = 'none';
cssRenderer.domElement.style.zIndex = '5';
appContainer.appendChild(cssRenderer.domElement);

// Create stars
const starsGroup = createAllStars(STAR_COUNT, pois, viewportWidth, viewportHeight);
scene.add(starsGroup);

// Create POIs
const poiObjects = createAllPOIs(pois, scene);

// Create connecting lines
const linesGroup = createConnectingLines(pois);
scene.add(linesGroup);

// Set up event handlers
setupMouseMoveHandler(poiObjects);
setupScrollHandler();
setupResizeHandler(onWindowResize);
setupClickHandler(poiObjects);

// --- Fix scroll clamping: clamp camera based on POI positions, not header/footer ---
let yPositions = pois.map(p => p.position.y);
let maxY = Math.max(...yPositions);
let minY = Math.min(...yPositions);
const paddingY = 100; // Keep this for positioning

// Header
const headerDiv = document.createElement('div');
headerDiv.className = 'css3d-element css3d-header';
headerDiv.innerHTML = '<h1>Editable Header Title</h1>';
headerDiv.style.width = '250px';
headerDiv.style.fontSize = '0.5em';
headerDiv.style.background = 'none';
headerDiv.style.color = '#fff';
headerDiv.style.pointerEvents = 'auto';
const headerObj = new CSS3DObject(headerDiv);
// Vertically center header in the padding area
const headerWorldHeight = 20; // Adjusted for better centering
headerObj.position.set(0, maxY + paddingY - headerWorldHeight / 2, 0);
headerObj.rotation.set(0, 0, 0);
scene.add(headerObj);

// Footer
const footerDiv = document.createElement('div');
footerDiv.className = 'css3d-element css3d-footer';
footerDiv.innerHTML = `
    <nav>
        <a href="#">Link 1</a>
        <a href="#">Link 2</a>
        <a href="#">Link 3</a>
        <a href="#">Link 4</a>
        <a href="#">Link 5</a>
    </nav>
    <p>&copy; S&A 2025</p>
`;
// Smaller font size
footerDiv.style.width = '600px';
footerDiv.style.fontSize = '0.7em';
footerDiv.style.background = 'none';
footerDiv.style.color = '#ccc';
footerDiv.style.pointerEvents = 'auto';
const footerObj = new CSS3DObject(footerDiv);
footerObj.position.set(0, minY - paddingY, 0);
footerObj.rotation.set(0, 0, 0);
scene.add(footerObj);

// Animation loop
let lastTime = performance.now();
function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const elapsed = (now - lastTime) / 1000;
    lastTime = now;
    // Camera scroll
    // Clamp scrollVelocity before applying
    if (scrollState.velocity > MAX_SCROLL_SPEED) scrollState.velocity = MAX_SCROLL_SPEED;
    if (scrollState.velocity < -MAX_SCROLL_SPEED) scrollState.velocity = -MAX_SCROLL_SPEED;
    if (Math.abs(scrollState.velocity) > 0.001) {
        camera.position.y += scrollState.velocity;
        scrollState.velocity *= SCROLL_DAMPING;
    }
    // Clamp camera based on POI positions, not header/footer
    const cameraViewHeight = camera.top - camera.bottom;
    const clampMinY = Math.min(minY, maxY) + cameraViewHeight / 2 - paddingY;
    const clampMaxY = Math.max(minY, maxY) - cameraViewHeight / 2 + paddingY;
    camera.position.y = Math.max(clampMinY, Math.min(clampMaxY, camera.position.y));

    // No need to update projection matrix here unless zoom changes
    // camera.updateProjectionMatrix();

    // Update stars
    updateStars(starsGroup, now * 0.001, camera.position.y, mouseWorldPosition);
    // Update POIs
    updatePOIs(poiObjects, now * 0.001, raycaster);

    // Update info box position if open
    if (currentInfoBox && currentInfoBox.dataset.poiPositionX !== undefined) {
        const poiPosition = new THREE.Vector3(
            parseFloat(currentInfoBox.dataset.poiPositionX),
            parseFloat(currentInfoBox.dataset.poiPositionY),
            parseFloat(currentInfoBox.dataset.poiPositionZ)
        );
        const pos = poiPosition.clone();
        pos.project(camera); // Project using the current camera state

        // Use canvas dimensions for screen coordinate calculation
        const canvasRect = canvas.getBoundingClientRect(); // Get canvas position and size
        const screenX = (pos.x * 0.5 + 0.5) * canvasRect.width + canvasRect.left + 20; // Add canvas left offset
        const screenY = (-pos.y * 0.5 + 0.5) * canvasRect.height + canvasRect.top - 20; // Add canvas top offset

        currentInfoBox.style.left = `${screenX}px`;
        currentInfoBox.style.top = `${screenY}px`;
    }

    // Keep header/footer in correct X/Z, but let them scroll with the scene
    headerObj.position.x = 0;
    headerObj.position.z = 0;
    headerObj.position.y = maxY + paddingY - headerWorldHeight / 2;
    footerObj.position.x = 0;
    footerObj.position.z = 0;
    footerObj.position.y = minY - paddingY;

    // Render
    renderer.render(scene, camera); // Render WebGL scene
    cssRenderer.render(scene, camera); // Render CSS3D scene (overlays WebGL)
}

// Get the canvas element
const canvas = document.getElementById('bg');

function onWindowResize() {
    // Use canvas dimensions, not window dimensions
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;

    // --- Recalculate viewport dimensions based on POI data and aspect ratio ---
    // Get new aspect ratio
    const aspect = canvasWidth / canvasHeight;

    // Get POI Y range
    yPositions = pois.map(p => p.position.y);
    maxY = Math.max(...yPositions);
    minY = Math.min(...yPositions);

    // Calculate new viewport height (span of POIs plus margin)
    const poiSpan = Math.abs(maxY - minY);
    const margin = 0.1 * poiSpan;
    const newViewportHeight = poiSpan + margin;
    const newViewportWidth = newViewportHeight * aspect;

    // Update camera frustum
    camera.top = newViewportHeight / 2;
    camera.bottom = -newViewportHeight / 2;
    camera.left = -newViewportWidth / 2;
    camera.right = newViewportWidth / 2;
    camera.updateProjectionMatrix();

    // Optionally, keep camera centered on POIs
    camera.position.x = 0;
    // camera.position.y = (maxY + minY) / 2; // Don't reset Y, let scroll logic handle it

    renderer.setSize(canvasWidth, canvasHeight); // Resize WebGL renderer
    cssRenderer.setSize(canvasWidth, canvasHeight); // Resize CSS3D renderer

    // Update header/footer positions on resize (in case POI Y changes)
    headerObj.position.y = maxY + paddingY - headerWorldHeight / 2;
    footerObj.position.y = minY - paddingY;
}

// Initial call to set size correctly
onWindowResize();

// Set initial camera position to top (just below header)
camera.position.y = maxY + paddingY - camera.top;

animate();
