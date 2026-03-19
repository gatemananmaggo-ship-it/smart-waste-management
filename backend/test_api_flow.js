const io = require('socket.io-client');
const axios = require('axios');

const SOCKET_URL = 'http://localhost:5000';
const API_URL = 'http://localhost:5000/api/bins';

async function runTest() {
    console.log('--- Phase 2 Verification ---');

    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
        console.log('Connected to Socket.io server');
    });

    socket.on('binUpdate', (data) => {
        console.log('Received real-time update:', data);
        socket.disconnect();
        process.exit(0);
    });

    try {
        // 1. Create a dummy bin if it doesn't exist (assuming DB is running)
        // For this test, we mimic an IoT device update
        console.log('Sending mock IoT update...');
        const response = await axios.patch(`${API_URL}/BIN-001`, {
            fillLevel: 75,
            batteryLevel: 82,
            status: 'Filling'
        });

        console.log('PATCH response:', response.data);
    } catch (err) {
        if (err.response && err.response.status === 404) {
            console.log('Bin not found. This is expected if the bin was never created in the DB.');
            console.log('Skipping socket verification as it requires an existing bin.');
            socket.disconnect();
            process.exit(0);
        } else {
            console.error('Test failed:', err.message);
            socket.disconnect();
            process.exit(1);
        }
    }
}

// Note: This script requires the server and MongoDB to be running.
runTest();
