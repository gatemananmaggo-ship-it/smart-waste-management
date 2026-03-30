require('dotenv').config();
const smsService = require('./utils/smsService');

async function testSMS() {
    console.log('--- SMS API Verification ---');
    
    // Check if API Key is set
    if (!process.env.SMS_API_KEY) {
        console.error('❌ ERROR: SMS_API_KEY is not set in .env file!');
        process.exit(1);
    }

    // You can change this to your actual phone number to test delivery
    const testPhone = process.argv[2] || '8151978280'; 
    const binId = 'BIN-TEST-001';
    const area = 'Test Location (Sector 62)';

    console.log(`[TEST] Using API Key: ${process.env.SMS_API_KEY.substring(0, 5)}...${process.env.SMS_API_KEY.slice(-5)}`);
    console.log(`[TEST] Sending test SMS to: ${testPhone}`);
    console.log(`[TEST] Message: Alert: Bin ${binId} is 90% full. Location: ${area}. Please empty it. - EcoSmart`);

    try {
        const result = await smsService.sendFullBinAlert(testPhone, binId, area);
        console.log('\n--- API Response ---');
        console.log(JSON.stringify(result, null, 2));
        
        if (result && (result.return === true || result.status === 'success' || result.request_id)) {
            console.log('\n✅ SMS API seems to be working! (Check your phone for the message)');
        } else {
            console.log('\n❌ SMS API returned an unexpected response format.');
        }
    } catch (error) {
        console.error('\n❌ SMS API Test Failed!');
        console.error('Error Details:', error.message);
    }
}

testSMS();
