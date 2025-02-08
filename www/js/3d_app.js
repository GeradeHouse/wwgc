// This file is an ES module.
// Import necessary classes from Three.js and its examples.
import * as THREE from "../../node_modules/three/build/three.module.js";
import { OrbitControls } from "../../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "../../node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { ShaderPass } from "../../node_modules/three/examples/jsm/postprocessing/ShaderPass.js";
import { MaskPass } from "../../node_modules/three/examples/jsm/postprocessing/MaskPass.js";
import { CopyShader } from "../../node_modules/three/examples/jsm/shaders/CopyShader.js";

// Expose THREE globally for any legacy scripts.
window.THREE = THREE;

// Define constants.
const CAMERA_HEIGHT = 0;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;

// Global variables.
var camera, scene, renderer, composer;
var controls; // fallback OrbitControls (legacy mode)
var element, container;
var clock = new THREE.Clock();
var BLEND_FACTOR = 0.5;

// (We no longer use DeviceOrientationControls fallback.)
  
// Update message text if screenfull is not enabled.
if (!window.screenfull || !screenfull.enabled) {
  document.getElementById("title").innerHTML = "Rotate phone horizontally";
}

function setMessageVisible(id, is_visible) {
  const css_visibility = is_visible ? "block" : "none";
  document.getElementById(id).style.display = css_visibility;
}

function isFullscreen() {
  const screen_width = Math.max(window.screen.width, window.screen.height);
  const screen_height = Math.min(window.screen.width, window.screen.height);
  return window.document.hasFocus() &&
         (screen_width === window.innerWidth) &&
         (screen_height === window.innerHeight);
}

function resize() {
  const width = container.offsetWidth;
  const height = container.offsetHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setViewport(0, 0, width, height);
  composer.setSize(width, height);
  if (window.WURFL && WURFL.is_mobile) {
    setMessageVisible('message_fullscreen', !isFullscreen());
  }
}

// Legacy animate function (used in fallback mode).
// When an immersive XR session is active, renderer.setAnimationLoop(animate) is used.
function animate(t) {
  const delta = clock.getDelta();
  // In XR mode, the camera pose is updated automatically.
  if (!renderer.xr.getSession()) {
    camera.updateProjectionMatrix();
    if (controls) controls.update(delta);
  }
  composer.render();
}

// Log that the script loaded.
console.log("3d_app.js loaded");
if (window.socket) window.socket.emit('client-log', "3d_app.js loaded");

//
// New XR initialization function.
//
async function initXRSession() {
  if (navigator.xr) {
    try {
      const supported = await navigator.xr.isSessionSupported('immersive-vr');
      if (supported) {
        const session = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor'] });
        console.log("[DEBUG] XR session acquired:", session);
        if (window.socket) window.socket.emit('client-log', "[DEBUG] XR session acquired: " + JSON.stringify(session));
        renderer.xr.enabled = true;
        renderer.xr.setSession(session);
        if (controls) {
          controls.dispose();
          controls = null;
        }
        renderer.setAnimationLoop(animate);
        return;
      } else {
        console.warn("immersive-vr session not supported. Falling back to legacy controls.");
        if (window.socket) window.socket.emit('client-warn', "immersive-vr session not supported. Falling back to legacy controls.");
      }
    } catch (e) {
      console.error("Failed to start immersive-vr session:", e);
      if (window.socket) window.socket.emit('client-error', "Failed to start immersive-vr session: " + e);
    }
  } else {
    console.warn("navigator.xr not available. Falling back to legacy controls.");
    if (window.socket) window.socket.emit('client-warn', "navigator.xr not available. Falling back to legacy controls.");
  }
}

//
// Fallback initialization for Cardboard device parameters.
// This fallback uses OrbitControls only and the Cardboard libraries.
function init_with_cardboard_device(ws, cardboard_device) {
  renderer = new THREE.WebGLRenderer();
  element = renderer.domElement;
  element.onclick = () => { element.requestFullscreen({}); };
  container = document.getElementById('example');
  container.appendChild(element);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(90, 1, CAMERA_NEAR, CAMERA_FAR);
  camera.position.set(0, CAMERA_HEIGHT, 0);
  scene.add(camera);

  controls = new OrbitControls(camera, element);
  controls.rotateUp(Math.PI / 4);
  controls.target.set(
    camera.position.x + 0.1,
    camera.position.y,
    camera.position.z
  );
  console.log('[DEBUG] Adding OrbitControls event listeners');
  if (window.socket) window.socket.emit('client-log', "[DEBUG] Adding OrbitControls event listeners");
  controls.addEventListener('start', function(event) {
    console.log('[DEBUG] OrbitControls start: user initiated swipe', event);
    if (window.socket) window.socket.emit('client-log', "[DEBUG] OrbitControls start: user initiated swipe " + JSON.stringify(event));
  });
  controls.addEventListener('end', function(event) {
    console.log('[DEBUG] OrbitControls end: swipe interaction ended', event);
    if (window.socket) window.socket.emit('client-log', "[DEBUG] OrbitControls end: swipe interaction ended " + JSON.stringify(event));
  });
  controls.noZoom = true;
  controls.noPan = true;

  const light = new THREE.HemisphereLight(0x777777, 0x000000, 0.6);
  scene.add(light);

  const box_width = 10;
  const texture = THREE.ImageUtils.loadTexture('textures/patterns/box.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(box_width, box_width);
  const face_colors = [0xA020A0, 0x20A020, 0x50A0F0, 0x404040, 0xA0A0A0, 0xA0A020];
  const materialArray = [];
  face_colors.forEach(function(c) {
    materialArray.push(new THREE.MeshBasicMaterial({
      map: texture,
      color: c,
      side: THREE.BackSide
    }));
  });
  const env_cube = new THREE.Mesh(
    new THREE.BoxGeometry(box_width, box_width, box_width),
    new THREE.MeshFaceMaterial(materialArray)
  );
  scene.add(env_cube);

  const screen_params = CARDBOARD.findScreenParams();
  const cardboard_view = new CARDBOARD.CardboardView(screen_params, cardboard_device);

  composer = new EffectComposer(renderer);
  composer.addPass(new THREE.CardboardStereoEffect(cardboard_view, scene, camera));

  const barrel_distortion = new ShaderPass(THREE.CardboardBarrelDistortion);
  barrel_distortion.uniforms.backgroundColor.value = new THREE.Vector4(1, 0, 0, 1);
  barrel_distortion.renderToScreen = true;
  composer.addPass(barrel_distortion);

  ws.on("message", function(val) {
    if (typeof val === "string") { val = JSON.parse(val); }
    console.log("[DEBUG] Received parameter update via socket.io:", val);
    if (window.socket) window.socket.emit('client-log', "[DEBUG] Received parameter update via socket.io: " + JSON.stringify(val));
    cardboard_view.device = CARDBOARD.uriToParams(val.params_uri);
    CARDBOARD.updateBarrelDistortion(barrel_distortion, cardboard_view, CAMERA_NEAR, CAMERA_FAR, val.show_lens_center);
    if (composer.passes.length > 0) { composer.removePass(composer.passes[0]); }
    const stereoEffect = new THREE.CardboardStereoEffect(cardboard_view, scene, camera);
    composer.addPass(stereoEffect);
    composer.reset();
    camera.updateProjectionMatrix();
    if (typeof cardboard_view.update === 'function') { cardboard_view.update(); }
    composer.render();
    console.log("[DEBUG] VR scene updated with new parameters.");
    if (window.socket) window.socket.emit('client-log', "[DEBUG] VR scene updated with new parameters.");
  });
  window.addEventListener('resize', resize, false);
  window.cardboardScene = {
    composer: composer,
    cardboard_view: cardboard_view,
    camera: camera,
    scene: scene,
    barrel_distortion: barrel_distortion
  };
  window.setTimeout(resize, 1);
  window.requestAnimationFrame(animate);
}

/**
 * Checks for WebGL support in the current browser.
 * @returns {boolean} True if WebGL is supported, false otherwise.
 */
function hasWebGl() {
  const canvas = document.createElement("canvas");
  try {
    return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch (x) {
    return false;
  }
}

/**
 * Initializes the 3D application.
 * Sets up WebSocket connection and initializes the scene.
 */
function init() {
  if (!hasWebGl()) {
    console.log('WebGL not available');
    if (window.socket) window.socket.emit('client-log', "WebGL not available");
    setMessageVisible('message_webgl', true);
    return;
  }
  const socket = io(window.location.origin, { transports: ["websocket"] });
  window.socket = socket;
  (function() {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    console.log = function(...args) {
      socket.emit('client-log', args.join(' '));
      originalLog.apply(console, args);
    };
    console.warn = function(...args) {
      socket.emit('client-warn', args.join(' '));
      originalWarn.apply(console, args);
    };
    console.error = function(...args) {
      socket.emit('client-error', args.join(' '));
      originalError.apply(console, args);
    };
  })();

  socket.on("connect", function() {
    console.log("[DEBUG] socket.io connected (3D app):", socket.id);
  });
  socket.on("connect_error", function(error) {
    console.error("[DEBUG] socket.io connection error (3D app):", error);
  });
  socket.on("disconnect", function() {
    console.log("[DEBUG] socket.io disconnected (3D app).");
  });

  const device = CARDBOARD.uriToParams('http://google.com/cardboard/cfg?p=CgN4eXMSBnBpY28gdR0xCCw9JY_CdT0qEAAASEIAAEhCAABcQgAAXEJYADUpXA89OggUrkc_SOGaP1AAYAA');
  
  initXRSession().then(() => {
    if (!renderer.xr.getSession()) {
      init_with_cardboard_device(socket, device);
    }
  });
  
  socket.onerror = function(e) {
    console.error('[DEBUG] socket.io error (3D app):', e);
  };
  socket.onclose = function() {
    console.log('[DEBUG] socket.io disconnected (3D app).');
  };
}
init();
