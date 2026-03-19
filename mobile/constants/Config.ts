// Centralized API configuration for the mobile app
// Update this to your live Render URL
const BASE_URL = 'https://smart-waste-api-epmw.onrender.com';

const CONFIG = {
    API_BASE_URL: `${BASE_URL}/api`,
    API_BINS: `${BASE_URL}/api/bins`,
    API_AUTH: `${BASE_URL}/api/auth`,
    SOCKET_URL: BASE_URL
};

export default CONFIG;
