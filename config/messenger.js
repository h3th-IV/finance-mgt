const axios = require("axios");
require("dotenv").config();

/**
 * Send OTP SMS via Kudi SMS
 * @param {string} phoneNumber - Recipient phone number (e.g., +234XXXXXXXXXX).
 * @param {string} otp - The OTP to send.
 * @returns {Promise<object>} - API response or error.
 */
const smsOTP = async (phoneNumber, otp) => {
    try {
        const payload = {
            token: process.env.KUDI_SMS_TOKEN,
            senderId: "CapitalWisPayment",
            recipients: phoneNumber.replace("+", ""),//strip off any +
            otp,
            appnamecode: process.env.KUDI_APPNAME_CODE,
            templatecode: process.env.KUDI_TEMPLATE_CODE,
        };

        const response = await axios.post(
            `${process.env.KUDI_SMS_URL}/otp`,
            payload,
            { maxBodyLength: Infinity }
        );

        if (response.data.status === "success") {
            return { success: true, message: "SMS sent successfully" };
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        console.error("Error sending SMS:", error.message);
        return { success: false, message: "Failed to send SMS" };
    }
};

module.exports = { smsOTP };