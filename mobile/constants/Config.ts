// Centralized API configuration for the mobile app
const SERVER_IP = '192.168.1.3'; // UPDATE THIS TO YOUR PC'S IP ADDRESS
const PORT = '5000';

const CONFIG = {
    API_BASE_URL: `http://${SERVER_IP}:${PORT}/api`,
    API_BINS: `http://${SERVER_IP}:${PORT}/api/bins`,
    API_AUTH: `http://${SERVER_IP}:${PORT}/api/auth`,
    SOCKET_URL: `http://${SERVER_IP}:${PORT}`
};

export default CONFIG;
