const axios = require('axios');
require("dotenv").config();



const baseURL = 'https://my.kudisms.net';
const endpoint = '/api/otp';
const token = process.env.MESSENGER_YEK;
const app_name_code = process.env.IDUK_APP_NAME_CODE;
const template_code = process.env.IDUK_SIGN_UP_TEMPLATE_CODE;
const senderId = 'CAPITALWISE'; //TODO 

async function sendSMSOTP(recipients, otp) {
    const url = `${baseURL}${endpoint}`;
    const payload = {
        token,
        senderId: senderId,
        recipients,
        otp,
        appnamecode: app_name_code,
        templatecode: template_code,
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('SMS sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending SMS:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = sendSMSOTP;
