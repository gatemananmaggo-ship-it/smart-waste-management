// Centralized API configuration for the frontend
const IS_LOCAL = false; // Change to false to use the live Render server

const LOCAL_URL = 'http://192.168.1.6:5000';
const LIVE_URL = 'http://13.232.18.222:5000';

const BASE_URL = IS_LOCAL ? LOCAL_URL : LIVE_URL;

const CONFIG = {
    API_BASE_URL: BASE_URL,
    API_URL: `${BASE_URL}/api`,
    API_BINS: `${BASE_URL}/api/bins`,
    API_AUTH: `${BASE_URL}/api/auth`,
    SOCKET_URL: BASE_URL
};

export default CONFIG;
