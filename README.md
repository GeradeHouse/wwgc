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

These two components synchronize data in real time.

## Important Pending Implementation

Currently, the VR scene only supports swipe-based movement instead of responding to device orientation. Real-time head tracking is a core feature of Cardboard-style viewers, so two items are crucial:

1. **Live Parameter Sync via Socket.IO:**
   • The Angular UI continuously monitors the form fields and, when a parameter changes, emits a Socket.IO event carrying a URI that encodes the new viewer parameters.
   • The VR scene (implemented in files such as `www/js/3d_app.js` and `www/js/Cardboard.js`) listens for this event, parses the URI using `CARDBOARD.uriToParams()`, and updates the viewer’s calibration parameters accordingly.
   • The VR scene then updates its rendering pipeline—by re-creating the stereo effect pass, adjusting distortion correction parameters, and triggering a re-render—so that the new settings are reflected in real time.
   • **Note:** This live synchronization now leverages Socket.IO’s robust connection management instead of raw WebSockets. If multi-device synchronization is required in the future, the server-side can be extended to broadcast parameter updates to all connected clients.

2. **HTTPS for Sensor Access:**  
   • Enable HTTPS by default so mobile browsers allow orientation and motion events.  
   • Use a self-signed certificate locally and verify the secure context on all devices.  
   • Confirm that the environment grants permission for motion sensors (some devices require explicit user approval).

Once these pieces are in place, any parameter change in the form will instantly appear in the VR scene, and rotating the device will adjust the viewpoint as you would expect from a true Cardboard viewer.

The result is a Cardboard device URI which you can use to generate QR Codes or NFC tags to pair your viewer with a mobile device.

## Web App Approach

The profile generator is also a proof-of-concept for a web VR app that works with Cardboard. It implements stereo view and distortion correction equivalent to the Cardboard Java SDK for Android, and it only requires a WebGL-capable browser. The main inputs for correct rendering are:
1. A Cardboard viewer profile.
2. An accurate pixel-per-inch (PPI) value for the display screen.

However, there are some limitations:

- **Physical Screen Properties:** There is no automatic way to detect physical screen properties. See this [enlightening rant](http://smus.com/physical-units/) on physical units.
- **Orientation Drift:** Magnets used as triggers may cause orientation drift problems on Android (the Android Chrome implementation uses the magnetometer for orientation).
- **Trigger Access:** There is no access to a Cardboard-style magnet trigger.
- **Antialiasing Limitations:** The distortion correction pass prevents use of standard antialiasing techniques. (WebGL2 multisampled renderbuffers or shader-based antialiasing—like [FXAA](https://github.com/mrdoob/three.js/blob/master/examples/js/shaders/FXAAShader.js)—can help.)

This implementation of Cardboard rendering is built on the three.js framework. If you're interested in the details, see the Cardboard*.js source files.

---

# Running Local Web Server

To run your own instance:

1. **Launch the Local Web Server:**  
   The local web server is located in the `webserver` directory and now uses HTTPS via Node.js with Koa.
2. **Configure Port Forwarding:**  
   Set up port forwarding on your router for the web server’s port (default is 8000) so that the `3d.html` page can be accessed from your mobile device.
3. **Generate QR Codes:**  
   Use an external QR Code generator (for example, an online tool) to create a QR Code from the URL displayed in "Save or load viewer parameters."

No further configuration (e.g., Firebase settings) is required.

---

# Running the Local Web Server

To launch the local web server on your PC:

1. Open a terminal in the project root.
2. Run the following command:
    ```sh
    npm install && node webserver/main.js
    ```
   
This command starts the web server on port 8000 **using HTTPS**. Because modern browsers require a secure context (HTTPS) for VR functionality, ensure you access the application via `https://localhost:8000` (or the appropriate local network URL). Also, confirm that your router is configured for port forwarding if you intend to access the 3D calibration page (`3d.html`) from a mobile device on your local network.

---

# Installation and Requirements

- **Node.js:**  
  Ensure you have Node.js installed. The built-in Node.js modules (fs, path, net, child_process, https) are used, so no extra installation is required for these.

- **NPM Packages:**  
  Install the following packages:
  - [koa](https://www.npmjs.com/package/koa)
  - [@koa/router](https://www.npmjs.com/package/@koa/router)
  - [koa-send](https://www.npmjs.com/package/koa-send)
  - [koa-websocket](https://www.npmjs.com/package/koa-websocket)

A one-liner PowerShell command to upgrade Node.js (using Chocolatey) and install the required packages is:
```powershell
choco upgrade nodejs -y; npm install koa @koa/router koa-send koa-websocket
```

---

# Certificate Generation and Installation for Local HTTPS

To ensure that your local HTTPS server is trusted on mobile devices, follow these steps to generate, convert, and install the required CA certificate:

### 1. Generate and Verify the Root CA Certificate with mkcert

- **Generate the Local CA:**  
  Run the following command:
  ```sh
  mkcert -install
  ```
  This command creates a local CA certificate and installs it in your system’s trust store.

- **Locate and Verify the Root CA:**  
  Find the directory where the CA certificate is stored by running:
  ```sh
  mkcert -CAROOT
  ```
  The file `rootCA.pem` is your root CA. Verify it has the proper CA extensions (especially “Basic Constraints: CA:TRUE”) by running:
  ```sh
  openssl x509 -in "$(mkcert -CAROOT)/rootCA.pem" -noout -text
  ```
  Ensure you see a section for Basic Constraints that indicates CA:TRUE along with proper key usage and subject key identifier extensions.

### 2. Convert the Root CA Certificate to DER Format

Android devices require certificates in DER format for CA installation. Convert the `rootCA.pem` certificate to DER by executing:
```sh
openssl x509 -in "$(mkcert -CAROOT)/rootCA.pem" -inform PEM -outform DER -out rootCA.crt
```
Verify that `rootCA.crt` retains the necessary CA properties:
```sh
openssl x509 -in rootCA.crt -inform DER -noout -text
```

### 3. Installing the Certificate on Android

1. Copy the generated `rootCA.crt` file into the `www` folder of your project.
2. Navigate on your Android device to:
    ```
    https://192.168.31.18:8000/certificates.html
    ```
   and download the certificate.
3. To install as a trusted CA certificate on Android:
   - Open **Settings** on your device.
   - Go to **Security** or **Biometrics & Security** → **Encryption & Credentials**.
   - Select **Install from storage**.
   - Locate and select the downloaded `rootCA.crt` file.
   - When prompted, choose to install it as a **Trusted CA certificate**. (If only options like “VPN & App user certificate” or “Wi‑Fi certificate” appear, it indicates the certificate might be missing the proper CA extensions. In that case, check the output of the verification step above and update/re-generate as needed.)
   - Restart your browser (or device) to ensure the certificate is now trusted.

Once the certificate is installed as a trusted CA, your Android device will trust the HTTPS connection to:
```
https://192.168.31.18:8000/3d.html
```
without any security warnings.

---

# Notes

- **HTTPS for Sensor Access:**  
  The secure connection is necessary for VR functionality. Mobile browsers require HTTPS to grant access to orientation and motion sensors.
- **Local Network Usage:**  
  This server is intended only for local network use. Do not expose it to the internet.
- **QR Code Generation:**  
  Currently, the QR Code is not auto-generated. Copy the URL from the viewer parameters section and use an external tool to generate the QR Code.

---

# Future Improvements

- **Live Parameter Sync via WebSockets:**  
  Implement a WebSocket layer that updates the VR scene in real time.
- **Real-time Head Tracking:**  
  Improve the VR scene to respond to device orientation instead of swipe-based movement.
