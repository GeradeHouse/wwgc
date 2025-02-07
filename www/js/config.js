/**
 * @fileoverview Configuration module for the WWGC (WebVR Viewer Generator & Configurator)
 * @module config
 */

/**
 * Global configuration object that defines essential application parameters.
 * @namespace
 * @property {string} GOOGLE_API_KEY - API key for Google services integration
 * @property {string} GOOGLE_ANALYTICS_ID - Google Analytics tracking identifier
 * @property {string} DYNAMIC_URL_BASE - Base URL for dynamic content, forced to HTTPS
 * @property {string} DYNAMIC_SECURE_URL - Secure URL mirror of DYNAMIC_URL_BASE
 */
var CONFIG = {
  GOOGLE_API_KEY: 'MY_KEY',
  GOOGLE_ANALYTICS_ID: '',
  DYNAMIC_URL_BASE: "https://" + window.location.host,
  DYNAMIC_SECURE_URL: "https://" + window.location.host
};
