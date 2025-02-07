# Development Guide

This document provides additional details for developers working on the WWGC project.

## Debugging

### Server-side Logging
The webserver implements consistent timestamp-based logging with multiple levels:
```javascript
logDebug("message")  // General debug information
logError("message")  // Error conditions
logWarn("message")   // Warning conditions
```

### Client-side Debugging
The application includes detailed debug logging for:

1. **Socket.IO Events:**
   - Connection events
   - Parameter sync messages
   - Latency measurements for updates
   - Reconnection attempts

2. **VR Scene Updates:**
   - Parameter changes
   - Stereo effect recreation
   - Barrel distortion updates
   - Device orientation events

3. **Configuration:**
   - Screen properties detection
   - PPI value handling
   - Viewport setup
   - HTTPS/certificate status

Debug messages are prefixed with timestamps and component tags for easy filtering, e.g.:
```
[2024-02-07T15:32:43.567Z] [3D Viewer] Received parameter update...
```

## Browser Console Filters
To focus on specific debug information, filter console output by:
- "[3D Viewer]" - For VR scene updates
- "[DEBUG]" - For general debugging
- "socket.io" - For connection events