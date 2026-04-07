const axios = require('axios');

/**
 * SMS Service for EcoSmart
 * This service handles sending alerts to workers when bins are full.
 * Now supports MSG91 and Fast2SMS.
 */

const SMS_CONFIG = {
    ENABLED: process.env.SMS_ENABLED === 'true' || true,
    API_KEY: process.env.SMS_API_KEY || '',
    PROVIDER: process.env.SMS_PROVIDER || 'FAST2SMS', // 'FAST2SMS', 'MSG91', 'MOCK'
    SENDER_ID: process.env.SMS_SENDER_ID || 'ECOSMT', // MSG91 Sender ID
    TEMPLATE_ID: process.env.SMS_TEMPLATE_ID || '', // MSG91 Template ID (Required for India DLT)
};

const sendFullBinAlert = async (phone, binId, area) => {
    const message = `Alert: Bin ${binId} is 90% full. Location: ${area}. Please empty it. - EcoSmart`;

    console.log(`[SMS SERVICE] Sending to ${phone}: ${message}`);
    const maskedKey = SMS_CONFIG.API_KEY ? `${SMS_CONFIG.API_KEY.substring(0, 4)}...${SMS_CONFIG.API_KEY.slice(-4)}` : 'MISSING';
    console.log(`[SMS SERVICE] Provider: ${SMS_CONFIG.PROVIDER} | Using Key: ${maskedKey}`);

    // Early exit if provider is MOCK
    if (SMS_CONFIG.PROVIDER === 'MOCK' || !SMS_CONFIG.ENABLED) {
        console.log('[SMS SERVICE] MOCK mode: Alert logged to console.');
        return { success: true, message: 'Mock SMS logged to console', provider: 'MOCK' };
    }

    if (!SMS_CONFIG.API_KEY) {
        console.error('[SMS SERVICE] ERROR: SMS_API_KEY is not set in environment variables!');
        return { success: false, message: 'SMS_API_KEY Missing' };
    }

    // Provider: MSG91
    if (SMS_CONFIG.PROVIDER === 'MSG91') {
        try {
            console.log(`[SMS SERVICE] Dispatching to MSG91 for ${phone}...`);
            const response = await axios.post('https://api.msg91.com/api/v5/otp', null, {
                params: {
                    template_id: SMS_CONFIG.TEMPLATE_ID,
                    mobile: phone.startsWith('91') ? phone : `91${phone}`, // Ensure Indian prefix
                    authkey: SMS_CONFIG.API_KEY,
                    // If you use Transactional/Flow API, parameters are different
                },
                // Note: For custom messages using "Flows" API:
                // url: 'https://api.msg91.com/api/v5/flow/',
                // data: { template_id: SMS_CONFIG.TEMPLATE_ID, recipients: [{ mobilenos: phone, binId, area }] }
            });

            if (response.data && response.data.type === 'success') {
                console.log(`[SMS SERVICE] Success: MSG91 accepted message for ${phone}.`);
                return { success: true, provider: 'MSG91', data: response.data };
            } else {
                console.warn(`[SMS SERVICE] MSG91 Rejected: ${JSON.stringify(response.data)}`);
                return { success: false, provider: 'MSG91', message: response.data?.message || 'Unknown error' };
            }
        } catch (error) {
            console.error(`[SMS SERVICE] MSG91 API Failure:`, error.message);
            throw new Error(`MSG91 Failed: ${error.message}`);
        }
    }

    // Provider: FAST2SMS (Old logic retained for backward compatibility)
    if (SMS_CONFIG.PROVIDER === 'FAST2SMS') {
        try {
            console.log(`[SMS SERVICE] Dispatching to Fast2SMS for ${phone}...`);
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

            if (response.data && response.data.return) {
                console.log(`[SMS SERVICE] Success: Fast2SMS sent message to ${phone}.`);
                return { success: true, provider: 'FAST2SMS', data: response.data };
            } else {
                console.warn(`[SMS SERVICE] Fast2SMS Rejected: ${JSON.stringify(response.data)}`);
                return { success: false, provider: 'FAST2SMS', message: response.data?.message || 'Unknown error' };
            }
        } catch (error) {
            console.error(`[SMS SERVICE] Fast2SMS Failure:`, error.message);
            throw new Error(`Fast2SMS Failed: ${error.message}`);
        }
    }

    return { success: false, message: `Provider ${SMS_CONFIG.PROVIDER} not supported` };
};

module.exports = { sendFullBinAlert };

