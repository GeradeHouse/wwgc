Changes: Add a web server for serve the files and removes the firebase.  
Only in local network, don't expose it to internet.  
Need port forwarding to make 3d.html work.  
Currently it cannot generate QR Code, you need to copy param url from "Save or load viewer parameters" and generate QR Code by your self.  

Viewer profile generator
==================================

The viewer profile generator is a tool for deriving the viewer
device profile used by [Google Cardboard](https://www.google.com/get/cardboard/) SDK's.
You can use this tool if you're creating a Google Cardboard-inspired device
with different optics, inputs or dimensions.

[Open the running version of the tool](https://www.google.com/get/cardboard/viewerprofilegenerator.html)
or read the [user guide](https://support.google.com/cardboard/manufacturers/checklist/6322188)
for more information.

<img src="docs/images/wwgc_screenshot.png">

Development
========================

Overview
--------

The tool assists you in deriving the set of parameters needed
to define a viewer device for use by Cardboard SDK's.  Some parameters are
a simple matter of entering text in a form (e.g. for vendor name),
while others require interactive calibration while looking at a scene
within the viewer (e.g. for distortion correction). Therefore the tool has two
components: 1) form entry and instructions running on a PC or laptop having a
keyboard, and 2) a remote 3D scene running on a phone placed into your viewer.
The two components sync data in real-time via the Firebase service, allowing
the rendering parameters to be updated dynamically as you change fields in
the form.

The result is a Cardboard device URI which you can use to generate
QR codes or NFC tags by which users can pair your viewer with their
mobile phone or other device.

Web app approach
----------------

The profile generator also happens to be a proof of concept for making a web
VR app which works with Cardboard, notably implementing stereo view
and distortion correction equivalent to the Cardboard Java SDK for Android.
It only requires a browser with proper WebGL support.  The top level inputs
required for correct rendering are 1) a Cardboard viewer profile, and
2) an accurate pixel-per-inch (PPI) value for the display screen.

However, there are also a number of limitations to this approach:

  * No way to get physical screen properties. See the following enlightening rant:
    [Let's get physical (units)](http://smus.com/physical-units/).
  * Magnets may cause orientation drift problems -
    The Android Chrome implementation of HTML5 orientation API
    uses the magnetometer.  If your viewer incorporates magnets, e.g. as
    a button trigger, it may cause tracking problems.  (The iOS
    browser doesn't use the magnetometer for orientation.)
  * No access to Cardboard-style magnet trigger.
  * Distortion correction pass precludes use of antialiasing -
    the multisampled renderbuffers promised with WebGL 2 will
    address this properly.  In the meantime it's possible to
    [antialias in the shader](https://github.com/mrdoob/three.js/blob/master/examples/js/shaders/FXAAShader.js).

This implementation of Cardboard rendering is built on the three.js
framework. If you're interested, see the Cardboard*.js source files.

Running your own instance without Firebase (Option A)
-------------------------------------------------------
 
This fork has removed Firebase integration to simplify local deployment.
To run your own instance:
 1. Launch the provided local web server (located in the "webserver" directory) to serve the static files.
 2. Configure port forwarding on your router for the web server's port to allow access to 3d.html from your mobile device.
 3. Use an external QR code generator (such as an online tool) to create a QR code from the URL displayed in "Save or load viewer parameters".
 
No further configuration (e.g., Firebase settings) are required.

Running the Local Web Server
----------------------------
To launch the local web server on your PC, open a terminal in the project root and run:
  deno run --allow-net --allow-read --allow-write --allow-env webserver/main.ts
This command starts the web server on port 8000. Ensure that your router is configured for port forwarding if you intend to access the 3D calibration page (3d.html) from a mobile device on your local network.
