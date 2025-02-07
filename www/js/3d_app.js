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
var controls
var element, container

var clock = new THREE.Clock()

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

function animate(t) {
  var delta = clock.getDelta()
  camera.updateProjectionMatrix()
  controls.update(delta)
  composer.render()

  window.requestAnimationFrame(animate)
}

function setOrientationControls(e) {
  console.log("setOrientationControls called");
  if (!e.alpha) {
    return
  }

  controls = new THREE.DeviceOrientationControls(camera, true)
  controls.connect()
  controls.update()
  // Android
  element.addEventListener('click', function () {
    // Must be called here because initiated by user
    if (document.fullscreenEnabled) {
      screen.wakelock.release()
    } else {
      element.requestFullscreen()
      screen.wakelock.request()
    }

    screenfull.toggle()
  })

  document.addEventListener(screenfull.raw.fullscreenchange, function () {
    if (screenfull.isFullscreen) {
      // TODO: moz prefix for Firefox
      screen.orientation.lock('landscape')
    } else {
      screen.orientation.unlock()
    }
  })

  window.removeEventListener('deviceorientation', setOrientationControls, true)
}


/**
 * Initializes the 3D scene with Cardboard device parameters
 * @param {WebSocket} ws - WebSocket connection for live updates
 * @param {Object} cardboard_device - Cardboard device parameters
 */
function init_with_cardboard_device(ws, cardboard_device) {
  renderer = new THREE.WebGLRenderer()
  element = renderer.domElement
  element.onclick = () => {
    element.requestFullscreen({})
  }
  container = document.getElementById('example')
  container.appendChild(element)

  scene = new THREE.Scene()

  // NOTE: CardboardStereoPass will ignore camera FOV and aspect ratio
  camera = new THREE.PerspectiveCamera(90, 1, CAMERA_NEAR, CAMERA_FAR)
  camera.position.set(0, CAMERA_HEIGHT, 0)
  scene.add(camera)

  controls = new THREE.OrbitControls(camera, element)
  controls.rotateUp(Math.PI / 4)
  controls.target.set(
    camera.position.x + 0.1,
    camera.position.y,
    camera.position.z
  )
  controls.noZoom = true
  controls.noPan = true

  window.addEventListener('deviceorientation', setOrientationControls, true)

  var light = new THREE.HemisphereLight(0x777777, 0x000000, 0.6)
  scene.add(light)

  // environment box with grid textures
  var box_width = 10  // i.e. surfaces are box_width/2 from camera
  var texture = THREE.ImageUtils.loadTexture(
    'textures/patterns/box.png'
  )
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
  var cardboard_view = new CARDBOARD.CardboardView(
    screen_params, cardboard_device)

  composer = new THREE.EffectComposer(renderer)

  composer.addPass(new THREE.CardboardStereoEffect(
    cardboard_view, scene, camera))

  var barrel_distortion = new THREE.ShaderPass(THREE.CardboardBarrelDistortion)
  // TODO: Consider having red background only when FOV angle fields
  // are in focus.
  barrel_distortion.uniforms.backgroundColor.value =
    new THREE.Vector4(1, 0, 0, 1)
  barrel_distortion.renderToScreen = true
  composer.addPass(barrel_distortion)

  // Using Socket.IO:
  // ws.on("message", function (data) {
  //   var val = JSON.parse(data);
  //   cardboard_view.device = CARDBOARD.uriToParams(val.params_uri)
  //   CARDBOARD.updateBarrelDistortion(barrel_distortion, cardboard_view,
  //     CAMERA_NEAR, CAMERA_FAR, val.show_lens_center)
  // })

  ws.on("message", function(val) {
    if (typeof val === "string") {
      val = JSON.parse(val);
    }
    console.log("[DEBUG] Received parameter update via socket.io:", val);
    // Update the cardboard device parameters.
    cardboard_view.device = CARDBOARD.uriToParams(val.params_uri);
    CARDBOARD.updateBarrelDistortion(barrel_distortion, cardboard_view,
      CAMERA_NEAR, CAMERA_FAR, val.show_lens_center);
    // Remove the existing stereo effect pass if it exists.
    if (composer.passes.length > 0) {
      composer.removePass(composer.passes[0]);
    }
    // Create a new CardboardStereoEffect pass with updated parameters.
    const stereoEffect = new THREE.CardboardStereoEffect(cardboard_view, scene, camera);
    composer.addPass(stereoEffect);
    // Reset the composer buffers.
    composer.reset();
    // Update the camera projection matrix.
    camera.updateProjectionMatrix();
    // If available, call the update method on the cardboard view.
    if (typeof cardboard_view.update === 'function') {
      cardboard_view.update();
    }
    // Force an immediate render.
    composer.render();
    console.log("[DEBUG] VR scene updated with new parameters.");
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

  animate()
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
 * Sets up WebSocket connection and initializes the scene
 */
function init() {
  if (!hasWebGl()) {
    console.log('WebGL not available')
    setMessageVisible('message_webgl', true)
    return
  }
  const socket = io(window.location.origin, { transports: ["websocket"] });
  // Debug logging for 3D app socket.io events
  socket.on("connect", function() {
    console.log("[DEBUG] socket.io connected (3D app):", socket.id);
  });
  socket.on("connect_error", function(error) {
    console.error("[DEBUG] socket.io connection error (3D app):", error);
  });
  socket.on("disconnect", function() {
    console.log("[DEBUG] socket.io disconnected (3D app).");
  });

  // Initialize with default parameters
  const device = CARDBOARD.uriToParams('http://google.com/cardboard/cfg?p=CgN4eXMSBnBpY28gdR0xCCw9JY_CdT0qEAAASEIAAEhCAABcQgAAXEJYADUpXA89OggUrkc_SOGaP1AAYAA')
  init_with_cardboard_device(socket, device)
  socket.onerror = function(e) {
    console.error('[DEBUG] socket.io error (3D app):', e);
  };
  socket.onclose = function() {
    console.log('[DEBUG] socket.io disconnected (3D app).');
  };
}
init()
