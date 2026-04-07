const { Expo } = require('expo-server-sdk');

/**
 * Push Notification Service using Expo
 * Handles sending notifications to mobile devices using Expo Push Tokens.
 */

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Send a push notification to one or more recipients
 * @param {Array<string>} pushTokens - Array of Expo Push Tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Optional data payload for the app
 */
const sendPushNotification = async (pushTokens, title, body, data = {}) => {
    const messages = [];
    
    for (let pushToken of pushTokens) {
        // Check that all your push tokens appear to be valid Expo push tokens
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
        }

        // Construct a message
        messages.push({
            to: pushToken,
            sound: 'default',
            title: title,
            body: body,
            data: data,
            priority: 'high',
            channelId: 'default', // for Android 8.0+
        });
    }

    // Use the Expo SDK to send the messages
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    for (let chunk of chunks) {
        try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(`[Push Notification] Sent chunk of ${chunk.length} messages`);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.error(`[Push Notification] Error sending chunk:`, error);
        }
    }

    // Note: In production, you would want to inspect tickets to handle errors/invalid tokens
    // but for now, we'll just log success
    return tickets;
};

module.exports = { sendPushNotification };
