// Centralized API configuration for the frontend
// Update this to your live Render URL (e.g., 'https://smart-waste-api.onrender.com')
// Or use 'http://localhost:5000' for local testing
const BASE_URL = 'https://smart-waste-api-epmw.onrender.com';

const CONFIG = {
    API_BASE_URL: BASE_URL,
    API_URL: `${BASE_URL}/api`,
    API_BINS: `${BASE_URL}/api/bins`,
    API_AUTH: `${BASE_URL}/api/auth`,
    SOCKET_URL: BASE_URL
};

export default CONFIG;
