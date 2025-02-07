# Running Local Web Server

To run your own instance:

1. **Launch the Local Web Server:**  
   The local web server is located in the `webserver` directory and now uses HTTPS via Node.js with Socket.IO.
2. **Configure Port Forwarding:**  
   Set up port forwarding on your router for the web server’s port (default is 8000) so that the `3d.html` page can be accessed from your mobile device.
3. **Generate QR Codes:**  
   Use an external QR Code generator (for example, an online tool) to create a QR Code from the URL displayed in "Save or load viewer parameters."

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
  Install the following package:
  - [socket.io](https://www.npmjs.com/package/socket.io)

A one-liner PowerShell command to upgrade Node.js (using Chocolatey) and install the required package is:
```powershell
choco upgrade nodejs -y; npm install socket.io
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

# Setup Guide

## Prerequisites

### Desktop (Configuration Interface)
- Modern web browser
- Node.js 14.x or newer
- NPM (usually comes with Node.js)

### Mobile Device (VR Viewer)
- **Android:** Chrome 44 or newer
- **iOS:** Safari 8 or newer
- WebGL support
- Device orientation sensors
- Screen size larger than the viewer's visible area
- HTTPS connection for sensor access

## HTTPS Setup

1. **Generate Local Certificates:**
   The application requires HTTPS for mobile browser sensor access. Use mkcert to generate valid certificates for local development:

   ```bash
   # Install mkcert
   npm install -g mkcert

   # Generate certificates
   mkcert create-ca
   mkcert create-cert
   ```

   This will create `cert.pem` and `key.pem` in your project root.

2. **Install Root CA on Mobile Device:**
   - Copy the generated rootCA.crt to your mobile device
   - Install the certificate in your device's trusted certificates
   - On iOS, go to Settings > General > About > Certificate Trust Settings and enable the root certificate
   - On Android, go to Settings > Security > Install from storage and select the certificate

## Running the Local Web Server

To launch the local web server on your PC:

1. Open a terminal in the project root.
2. Run the following command:
    ```sh
    npm install && node webserver/main.js
    ```
   
This command starts the web server on port 8000 **using HTTPS**. Because modern browsers require a secure context (HTTPS) for VR functionality, ensure you access the application via `https://localhost:8000` (or the appropriate local network URL). Also, confirm that your router is configured for port forwarding if you intend to access the 3D calibration page (`3d.html`) from a mobile device on your local network.

## Troubleshooting

### Device Orientation Not Working
1. Ensure you're accessing the site via HTTPS
2. Check that your browser has permission to access device orientation:
   - On iOS: Settings > Safari > Motion & Orientation Access
   - On Android: Chrome > Site Settings > Motion Sensors
3. Some devices may require user interaction (like tapping the screen) before enabling orientation sensors

### QR Code Scanner Issues
- Ensure your mobile device's screen is not too dim
- QR code is automatically generated when parameters change
- The URL in the QR code must be accessible from your mobile device (use local network IP, not localhost)

### WebGL Not Available
- Verify your mobile browser supports WebGL
- Some older devices may not support the required WebGL features
- Try updating your browser to the latest version