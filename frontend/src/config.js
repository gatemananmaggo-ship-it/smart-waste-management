// Centralized API configuration for the frontend
const IS_LOCAL = false; // Change to false to use the live AWS server

const LOCAL_URL = 'http://192.168.1.6:5000';
const LIVE_URL = 'https://13-232-18-222.sslip.io';

const BASE_URL = IS_LOCAL ? LOCAL_URL : LIVE_URL;

const CONFIG = {
    API_BASE_URL: BASE_URL,
    API_URL: `${BASE_URL}/api`,
    API_BINS: `${BASE_URL}/api/bins`,
    API_AUTH: `${BASE_URL}/api/auth`,
    API_WORKERS: `${BASE_URL}/api/workers`,
    SOCKET_URL: BASE_URL
};

export default CONFIG;
