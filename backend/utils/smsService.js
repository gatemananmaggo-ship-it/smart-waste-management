const axios = require('axios');

/**
 * SMS Service for EcoSmart
 * This service handles sending alerts to workers when bins are full.
 * 
 * To use a real provider (e.g. Fast2SMS), update the API_KEY and uncomment the send method.
 */

const SMS_CONFIG = {
    ENABLED: true,
    API_KEY: process.env.SMS_API_KEY || 'YOUR_FAST2SMS_KEY',
    PROVIDER: 'FAST2SMS', // 'FAST2SMS' or 'TWILIO' or 'MOCK'
};

const sendFullBinAlert = async (phone, binId, area) => {
    const message = `Alert: Bin ${binId} is 90% full. Location: ${area}. Please empty it. - EcoSmart`;

    console.log(`[SMS SERVICE] Sending to ${phone}: ${message}`);

    if (SMS_CONFIG.PROVIDER === 'MOCK') {
        return { success: true, message: 'Mock SMS logged to console' };
    }

    if (SMS_CONFIG.PROVIDER === 'FAST2SMS') {
        try {
            // Example for Fast2SMS (Indian Provider)
            const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
                route: 'q',
                message: message,
                language: 'english',
                flash: 0,
                numbers: phone,
            }, {
                headers: {
                    "authorization": SMS_CONFIG.API_KEY
                }
            });
            return response.data;
        } catch (error) {
            console.error('Fast2SMS Error:', error.response?.data || error.message);
            throw error;
        }
    }

    return { success: false, message: 'Provider not configured' };
};

module.exports = { sendFullBinAlert };
