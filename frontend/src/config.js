// src/config.js
export const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"       // dev server
    : "http://clever_edison:3000";  // Docker container name of your backend