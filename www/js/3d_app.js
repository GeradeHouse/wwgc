// // Setup client logging via Socket.IO
// console.log('[CLIENT LOG] 3d_app.js loaded');
// if (typeof io !== 'undefined') {
//   const socket = io();
//   const originalLog = console.log;
//   const originalWarn = console.warn;
//   const originalError = console.error;

//   function sendClientLog(level, ...args) {
//     const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
//     socket.emit('client-log', `[CLIENT LOG] ${level}: ${message}`);
//   }

//   console.log = function(...args) {
//     sendClientLog('log', ...args);
//     originalLog.apply(console, args);
//   };

//   console.warn = function(...args) {
//     sendClientLog('warn', ...args);
//     originalWarn.apply(console, args);
//   };

//   console.error = function(...args) {
//     sendClientLog('error', ...args);
//     originalError.apply(console, args);
//   };
// }

/*!
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'
/**
 * @fileoverview Main 3D application module for the WWGC Configurator
 * Implements the core 3D rendering and interaction functionality
 * @module 3d_app
 */

/*global alert, document, screen, window, init,
  THREE, WURFL, screenfull, CARDBOARD, CONFIG, ga*/

// meter units
var CAMERA_HEIGHT = 0
var CAMERA_NEAR = 0.1
var CAMERA_FAR = 100

var camera, scene, renderer, composer
var controls // legacy fallback OrbitControls
var deviceControls = null; // legacy DeviceOrientationControls fallback
var element, container

var clock = new THREE.Clock()
// dummyDevice is used by legacy DeviceOrientationControls
var dummyDevice = new THREE.Object3D();
var BLEND_FACTOR = 0.5;

// Update the message text if on iOS
if (!screenfull.enabled) {
  document.getElementById("title").innerHTML = "Rotate phone horizontally"
}

function setMessageVisible(id, is_visible) {
  var css_visibility = is_visible ? "block" : "none"
  document.getElementById(id).style.display = css_visibility
}

function isFullscreen() {
  var screen_width = Math.max(window.screen.width, window.screen.height)
  var screen_height = Math.min(window.screen.width, window.screen.height)

  return window.document.hasFocus() &&
    (screen_width === window.innerWidth) &&
    (screen_height === window.innerHeight)
}

function resize() {
  var width = container.offsetWidth
  var height = container.offsetHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)
  renderer.setViewport(0, 0, width, height)

  composer.setSize(width, height)

  if (WURFL.is_mobile) {
    setMessageVisible('message_fullscreen', !isFullscreen())
  }
}

//
// Legacy animate function (used in fallback mode)
// When an immersive XR session is active, renderer.setAnimationLoop(animate) is used.
//
function animate(t) {
  var delta = clock.getDelta();
  // In XR mode, the camera pose is updated automatically.
  if (!renderer.xr.getSession()) {
    camera.updateProjectionMatrix();
    if (controls) {
      controls.update(delta);
    }
    if (deviceControls && controls && controls.state === controls.STATE.NONE) {
      deviceControls.update();
      camera.quaternion.copy(dummyDevice.quaternion);
      if (!window._lastDebug || (performance.now() - window._lastDebug) > 1000) {
        window._lastDebug = performance.now();
        console.log("[DEBUG] deviceControls updated, dummy quaternion:", dummyDevice.quaternion);
        if (window.socket) window.socket.emit('client-log', "[DEBUG] deviceControls updated, dummy quaternion: " + JSON.stringify(dummyDevice.quaternion));
      }
    }
  }
  composer.render();
}

//
// Legacy initialization for device orientation (fallback)
// This function is only used if WebXR immersive-vr is not available.
//
function setOrientationControls(e) {
  console.log("setOrientationControls called with event:", e);
  if (e.alpha == null) {
    console.warn("Device orientation event missing alpha value. Aborting initialization.");
    return;
  }
  console.log("Device orientation event detected. alpha:", e.alpha, ", beta:", e.beta, ", gamma:", e.gamma);
  deviceControls = new THREE.DeviceOrientationControls(dummyDevice, true);
  deviceControls.connect();
  deviceControls.update();
  console.log("DeviceOrientationControls initialized. Dummy device quaternion:", dummyDevice.quaternion);
  window.removeEventListener('deviceorientation', setOrientationControls, true);
}

console.log("3d_app.js loaded");
if (window.socket) window.socket.emit('client-log', "3d_app.js loaded");

//
// New XR initialization function
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
        window.removeEventListener('deviceorientation', setOrientationControls, true);
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
// Fallback initialization for Cardboard device parameters
//
function init_with_cardboard_device(ws, cardboard_device) {
  renderer = new THREE.WebGLRenderer();
  element = renderer.domElement
  element.onclick = () => {
    element.requestFullscreen({})
  }
  container = document.getElementById('example')
  container.appendChild(element)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(90, 1, CAMERA_NEAR, CAMERA_FAR)
  camera.position.set(0, CAMERA_HEIGHT, 0)
  scene.add(camera)

  controls = new THREE.OrbitControls(camera, element)
  controls.rotateUp(Math.PI / 4)
  controls.target.set(
    camera.position.x + 0.1,
    camera.position.y,
    camera.position.z
  );
  console.log('[DEBUG] Adding OrbitControls event listeners');
  if (window.socket) window.socket.emit('client-log', "[DEBUG] Adding OrbitControls event listeners");
  if (controls) {
    controls.addEventListener('start', function(event) {
      console.log('[DEBUG] OrbitControls start: user initiated swipe', event);
      if (window.socket) window.socket.emit('client-log', "[DEBUG] OrbitControls start: user initiated swipe " + JSON.stringify(event));
    });
    controls.addEventListener('end', function(event) {
      console.log('[DEBUG] OrbitControls end: swipe interaction ended', event);
      if (window.socket) window.socket.emit('client-log', "[DEBUG] OrbitControls end: swipe interaction ended " + JSON.stringify(event));
    });
  }

  ;(function() {
    if (controls) {
      controls.addEventListener('start', function(event) {
        console.log('[DEBUG] OrbitControls start: user initiated swipe', event);
      });
      controls.addEventListener('end', function(event) {
        console.log('[DEBUG] OrbitControls end: swipe interaction ended', event);
      });
    }
  })();

  (function() {
    if (controls) {
      controls.addEventListener('start', function(event) {
        console.log('[DEBUG] OrbitControls start: user initiated swipe', event);
      });
      controls.addEventListener('end', function(event) {
        console.log('[DEBUG] OrbitControls end: swipe interaction ended', event);
      });
    }
  })();

  controls.addEventListener('start', function(event) {
    console.log('[DEBUG] OrbitControls start: user initiated swipe', event);
  });
  controls.addEventListener('end', function(event) {
    console.log('[DEBUG] OrbitControls end: swipe interaction ended', event);
  });

  ;controls.addEventListener('start', function(event) {
    console.log('[DEBUG] OrbitControls start: user initiated swipe', event);
  });
  ;controls.addEventListener('end', function(event) {
    console.log('[DEBUG] OrbitControls end: swipe interaction ended', event);
  });

  controls.noZoom = true
  controls.noPan = true

  window.addEventListener('deviceorientation', setOrientationControls, true)

  var light = new THREE.HemisphereLight(0x777777, 0x000000, 0.6)
  scene.add(light)

  var box_width = 10
  var texture = THREE.ImageUtils.loadTexture('textures/patterns/box.png')
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(box_width, box_width)
  var face_colors = [0xA020A0, 0x20A020, 0x50A0F0, 0x404040, 0xA0A0A0, 0xA0A020]
  var materialArray = []
  face_colors.forEach(function (c) {
    materialArray.push(new THREE.MeshBasicMaterial({
      map: texture,
      color: c,
      side: THREE.BackSide
    }))
  })
  var env_cube = new THREE.Mesh(
    new THREE.BoxGeometry(box_width, box_width, box_width),
    new THREE.MeshFaceMaterial(materialArray)
  )
  scene.add(env_cube)

  var screen_params = CARDBOARD.findScreenParams()
  var cardboard_view = new CARDBOARD.CardboardView(screen_params, cardboard_device)

  composer = new THREE.EffectComposer(renderer)
  composer.addPass(new THREE.CardboardStereoEffect(cardboard_view, scene, camera))

  var barrel_distortion = new THREE.ShaderPass(THREE.CardboardBarrelDistortion)
  barrel_distortion.uniforms.backgroundColor.value = new THREE.Vector4(1, 0, 0, 1)
  barrel_distortion.renderToScreen = true
  composer.addPass(barrel_distortion)

  ws.on("message", function(val) {
    if (typeof val === "string") {
      val = JSON.parse(val);
    }
    console.log("[DEBUG] Received parameter update via socket.io:", val);
    if (window.socket) window.socket.emit('client-log', "[DEBUG] Received parameter update via socket.io: " + JSON.stringify(val));
    cardboard_view.device = CARDBOARD.uriToParams(val.params_uri);
    CARDBOARD.updateBarrelDistortion(barrel_distortion, cardboard_view, CAMERA_NEAR, CAMERA_FAR, val.show_lens_center);
    if (composer.passes.length > 0) {
      composer.removePass(composer.passes[0]);
    }
    const stereoEffect = new THREE.CardboardStereoEffect(cardboard_view, scene, camera);
    composer.addPass(stereoEffect);
    composer.reset();
    camera.updateProjectionMatrix();
    if (typeof cardboard_view.update === 'function') {
      cardboard_view.update();
    }
    composer.render();
    console.log("[DEBUG] VR scene updated with new parameters.");
    if (window.socket) window.socket.emit('client-log', "[DEBUG] VR scene updated with new parameters.");
  });
  window.addEventListener('resize', resize, false)
  window.cardboardScene = {
    composer: composer,
    cardboard_view: cardboard_view,
    camera: camera,
    scene: scene,
    barrel_distortion: barrel_distortion
  };
  window.setTimeout(resize, 1)
  window.requestAnimationFrame(animate)
}

/**
 * Checks for WebGL support in the current browser
 * @returns {boolean} True if WebGL is supported, false otherwise
 */
function hasWebGl() {
  var canvas = document.createElement("canvas")
  try {
    return Boolean(canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl"))
  } catch (x) {
    return false
  }
}

/**
 * Initializes the 3D application
 * Sets up WebSocket connection and initializes the scene < Let's see if this works!
 */
function init() {
  if (!hasWebGl()) {
    console.log('WebGL not available')
    if (window.socket) window.socket.emit('client-log', "WebGL not available");
    setMessageVisible('message_webgl', true)
    return
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

  const device = CARDBOARD.uriToParams('http://google.com/cardboard/cfg?p=CgN4eXMSBnBpY28gdR0xCCw9JY_CdT0qEAAASEIAAEhCAABcQgAAXEJYADUpXA89OggUrkc_SOGaP1AAYAA')
  
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
init()
