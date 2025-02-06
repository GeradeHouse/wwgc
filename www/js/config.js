/*
 * Configuration Object for the Cardboard Viewer Profile Generator.
 * This configuration is used across the client-side application.
 *
 * GOOGLE_API_KEY: Public key used for accessing Google APIs if required.
 *   Replace 'MY_KEY' with your actual key if needed.
 *
 * GOOGLE_ANALYTICS_ID: Tracking ID for Google Analytics.
 *   Leave empty to disable analytics.
 *
 * DYNAMIC_URL_BASE: The secure base URL for generating dynamic links.
 *   This value is forced to use HTTPS, ensuring that only the secure address is shown.
 *
 * DYNAMIC_SECURE_URL: Also the secure URL, identical to DYNAMIC_URL_BASE.
 */
var CONFIG = {
  GOOGLE_API_KEY: 'MY_KEY',
  GOOGLE_ANALYTICS_ID: '',
  DYNAMIC_URL_BASE: "https://" + window.location.host,
  DYNAMIC_SECURE_URL: "https://" + window.location.host
};
