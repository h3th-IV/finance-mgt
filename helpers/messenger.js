const axios = require('axios');
// require("dotenv").config();



const baseURL = 'https://my.kudisms.net';
const endpoint = '/api/otp';
const token = process.env.MESSENGER_YEK;
const app_name_code = process.env.IDUK_APP_NAME_CODE;
const template_code = process.env.IDUK_SIGN_UP_TEMPLATE_CODE;
const senderId = 'CAPITALWISE'; //TODO 

async function sendSMSOTP(recipients, otp) {
    const url = `${baseURL}${endpoint}`;
    console.log({url});
    
    const payload = {
        token,
        senderID: "CAPITALWISE",
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
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending SMS:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = sendSMSOTP;


async function sendMMSOtp(phoneNumber, message) {
    try {
        const tel = `234${phoneNumber.slice(1, 11)}`
        const apiUrl = 'https://portal.nigeriabulksms.com/api/';
        const username = encodeURIComponent('info@capitalwisepayment.com');
        const password = encodeURIComponent('Dynamicpayment@321');
        const sender = encodeURIComponent('Capitalwise');
        const mobile = encodeURIComponent(tel);
        const encodedMessage = encodeURIComponent(message);

        const url = `${apiUrl}?username=${username}&password=${password}&message=${encodedMessage}&sender=${sender}&mobiles=${mobile}`;

        const response = await axios.get(url);

        if (response.data.status === 'OK') {
            console.log('OTP sent successfully:', response.data);
            return { success: true, message: 'OTP sent successfully.' };
        } else {
            console.error('Failed to send OTP:', response.data);
            return { success: false, message: 'Failed to send OTP.', details: response.data };
        }
    } catch (error) {
        console.error('Error while sending OTP:', error.message);
        return { success: false, message: 'Error while sending OTP.', error: error.message };
    }
}

//module.exports = sendMMSOtp;
// sendMMSOtp('07035643850', "TETST OTP STUFF");


