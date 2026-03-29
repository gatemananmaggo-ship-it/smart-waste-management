require('dotenv').config();
const smsService = require('./utils/smsService');

async function testRecap() {
    try {
        console.log('Testing specific message with quote...');
        const result = await smsService.sendFullBinAlert('9958512646', 'BIN-001', "Exit at LT's");
        console.log('Response:', JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Test Failed:', err.message);
        process.exit(1);
    }
}

testRecap();
