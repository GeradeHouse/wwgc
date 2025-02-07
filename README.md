# Viewer Profile Generator

The viewer profile generator is a tool for deriving the viewer device profile used by [Google Cardboard](https://www.google.com/get/cardboard/) SDKs. You can use this tool if you're creating a Google Cardboard-inspired device with different optics, inputs, or dimensions.

- [Open the running version of the tool](https://www.google.com/get/cardboard/viewerprofilegenerator.html)
- Read the [user guide](https://support.google.com/cardboard/manufacturers/checklist/6322188) for more information.

<img src="docs/images/wwgc_screenshot.png" alt="Viewer Profile Generator Screenshot">

---

# Development

## Overview

The tool assists you in deriving the set of parameters needed to define a viewer device for use by Cardboard SDKs. Some parameters are a simple matter of entering text in a form (e.g., vendor name), while others require interactive calibration while viewing a scene through the viewer (e.g., for distortion correction). Therefore, the tool has two components:
1. **Form Entry & Instructions:** Running on a PC or laptop (with a keyboard).
2. **3D Scene:** Running remotely on a mobile phone placed into your viewer.

These two components synchronize data in real time using Socket.IO, allowing for immediate visual feedback as parameters are adjusted.

## Important Pending Implementation

Currently, the VR scene only supports swipe-based movement instead of responding to device orientation. Real-time head tracking is a core feature of Cardboard-style viewers, so two items are crucial:

1. **Live Parameter Sync via Socket.IO (✓ COMPLETED):**
   - The Angular UI continuously monitors the form fields and, when a parameter changes, emits a Socket.IO event carrying a URI that encodes the new viewer parameters.
   - The VR scene (implemented in files such as `www/js/3d_app.js` and `www/js/Cardboard.js`) listens for this event, parses the URI using `CARDBOARD.uriToParams()`, and updates the viewer's calibration parameters accordingly.
   - The VR scene then updates its rendering pipeline—by re-creating the stereo effect pass, adjusting distortion correction parameters, and triggering a re-render—so that the new settings are reflected in real time.
   - This live synchronization now leverages Socket.IO's robust connection management instead of raw WebSockets. If multi-device synchronization is required in the future, the server-side can be extended to broadcast parameter updates to all connected clients.

2. **HTTPS for Sensor Access (🚧 IN PROGRESS):**  
   - Enable HTTPS by default so mobile browsers allow orientation and motion events.  
   - Use a self-signed certificate locally and verify the secure context on all devices.  
   - Confirm that the environment grants permission for motion sensors (some devices require explicit user approval).
   - Device orientation code is already implemented through Three.js DeviceOrientationControls but requires proper HTTPS setup and permissions to function.

Once these pieces are in place, any parameter change in the form will instantly appear in the VR scene, and rotating the device will adjust the viewpoint as you would expect from a true Cardboard viewer.

## Web App Architecture

The profile generator demonstrates how to build a web VR app compatible with Cardboard. It implements:

1. **Real-time synchronization:**
   - Socket.IO for reliable real-time parameter updates 
   - Dynamic stereo view rendering
   - Live distortion correction
   - Instant scene updates on parameter changes
   - Automatic QR code generation from viewer parameters (Still needs to be tested)
   - Server-side broadcast support for potential multi-device sync (Not sure whether necessary)

2. **VR scene rendering:**
   - WebGL-based 3D graphics using Three.js
   - Custom stereo effect pass for VR
   - Barrel distortion shader
   - Scene composition with post-processing
   - Device orientation tracking support (requires HTTPS)
   - Screen wakelock to prevent display timeout during VR use

3. **Mobile browser support:**
   - Proper viewport configuration
   - Screen orientation handling
   - Full-screen mode support
   - Touch input detection
   - Support for modern android mobile browsers (Chrome 44+ on Android)

The main inputs needed for correct rendering are:
- A Cardboard viewer profile (synchronized live from the UI)
- An accurate pixel-per-inch (PPI) value for the display screen
  - Database lookup based on the device model for known PPI values for current smartphones and otherwise manual entry (not yet implemented)

Current limitations and known issues:

- **Head Tracking Not Yet Implemented:** Currently relies on swipe/touch for view control
- Physical screen properties must be detected or provided manually
- **Antialiasing Limitations:** The distortion correction pass prevents use of standard antialiasing techniques. (WebGL2 multisampled renderbuffers or shader-based antialiasing—like [FXAA](https://github.com/mrdoob/three.js/blob/master/examples/js/shaders/FXAAShader.js)—can help.)
- **Device Sensors:** Requires HTTPS and explicit user permission for orientation sensors
- **3D Scene Quality:** 3D Scene quality is low and needs higher resolution textures and models for better visual fidelity (not yet implemented)
- 3D Scene quality is low and needs higher resolution textures and models for better visual fidelity (not yet implemented)

This implementation of Cardboard rendering is built on the three.js framework. If you're interested in the details, see the Cardboard*.js source files.

---

# Notes

- **HTTPS for Sensor Access:**  
  The secure connection is necessary for VR functionality. Mobile browsers require HTTPS to grant access to orientation and motion sensors. After enabling HTTPS, the browser may still require explicit user permission to access device orientation sensors.
- **Local Network Usage:**  
  This server is intended only for local network use. Do not expose it to the internet.
- **QR Code Generation:**  
  Currently, the QR Code is not auto-generated. Copy the URL from the viewer parameters section and use an external tool to generate the QR Code.
- **Mobile Browser Support:**
  - Android: Chrome 44 or newer
  - Browser must support WebGL and deviceorientation events
  - HTTPS required for sensor access

---

# Future Improvements

- **Live Parameter Sync via Socket.IO:**  
  Implement a Socket.IO layer that updates the VR scene in real time.
- **Real-time Head Tracking:**  
  Improve the VR scene to respond to device orientation instead of swipe-based movement.
- **3D Scene Quality:**  
  Enhance the 3D scene with higher resolution textures and models for better visual fidelity.