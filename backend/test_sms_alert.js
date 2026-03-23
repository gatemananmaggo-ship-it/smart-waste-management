const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';
const TEST_HARDWARE_ID = 'TEST-BIN-SMS';

async function testSmsTrigger() {
    console.log('--- SMS Trigger Verification Test ---');
    
    try {
        // 1. Register a test user with a phone number
        console.log('1. Registering test user...');
        const signupRes = await axios.post(`${API_BASE_URL}/auth/register`, {
            username: `tester_${Date.now()}`,
            password: 'password123',
            email: `test_${Date.now()}@example.com`,
            area_access: 'Testing Area',
            state: 'Haryana',
            city: 'Gurugram',
            place: 'Test Place',
            phone: '9876543210'
        });
        const token = signupRes.data.token; // Note: Current register doesn't return token, need login
        console.log('User registered successfully.');

        // Login to get token
        const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
            username: signupRes.data.user.username,
            password: 'password123'
        });
        const authToken = loginRes.data.token;

        // 2. Create a test bin
        console.log('2. Creating test bin...');
        const binRes = await axios.post(`${API_BASE_URL}/bins`, {
            hardwareId: TEST_HARDWARE_ID,
            address: 'Test Street 123',
            location: { latitude: 28.4595, longitude: 77.0266 }
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('Bin created.');

        // 3. Trigger Full Bin Alert (95%)
        console.log('3. Updating bin to 95% (Should trigger SMS)...');
        const updateRes = await axios.patch(`${API_BASE_URL}/bins/${TEST_HARDWARE_ID}`, {
            fillLevel: 95,
            status: 'Full'
        });
        
        console.log('Response status:', updateRes.status);
        console.log('Check the backend console for: "[SMS SERVICE] Sending to 9876543210..."');

    } catch (err) {
        console.error('Test failed:', err.response?.data || err.message);
    }
}

testSmsTrigger();
