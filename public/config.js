// ==============================================================================
// PORTFOLIO CENTRALIZED API CONFIGURATION
// ==============================================================================

const RENDER_API_BASE_URL = "https://v2portfolio-pdnu.onrender.com/api";

// Auto-detect: use localhost when developing, Render when live
const isLocal = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '' ||
    window.location.protocol === 'file:'
);

const API_BASE_URL = isLocal ? 'http://localhost:5000/api' : RENDER_API_BASE_URL;

// Expose globally for all frontend scripts
window.API_BASE_URL = API_BASE_URL;
window.API_URL = API_BASE_URL;
