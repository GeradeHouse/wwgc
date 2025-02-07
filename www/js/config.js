
/**
 * @fileoverview Configuration module for the WWGC (WebVR Viewer Generator & Configurator) i.e. the Cardboard Viewer Profile Generator
 * @module config
 */

/**
 * Global configuration object that defines essential application parameters.
 * @namespace
 * @property {string} GOOGLE_API_KEY - API key for Google services integration (Not sure whether necessary for this application) TODO: Check if necessary
 * @property {string} GOOGLE_ANALYTICS_ID - Google Analytics tracking identifier. Leave empty to disable tracking. TODO: Check if necessary
 * @property {string} DYNAMIC_URL_BASE - Base URL for dynamic content, forced to HTTPS for security. TODO: Check whether this is correctly implemented
 * @property {string} DYNAMIC_SECURE_URL - Secure URL mirror of DYNAMIC_URL_BASE
 */
var CONFIG = {
  GOOGLE_API_KEY: 'MY_KEY',
  GOOGLE_ANALYTICS_ID: '',
  DYNAMIC_URL_BASE: "https://" + window.location.host,
  DYNAMIC_SECURE_URL: "https://" + window.location.host
};
