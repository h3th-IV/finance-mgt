const axios = require('axios');

// Replace with your Infobip API base URL and API key
const API_BASE_URL = "https://api.infobip.com";
const API_KEY = "910dbdc83940d92db6aed715b27f221a-b9499642-d4bd-4095-98bd-39233a85784d";

// Function to send SMS with a dynamic OTP
module.exports.sendOtp = async (recipientPhone, otpCode) => {
    console.log({recipientPhone, otpCode});
    console.log(`+234${recipientPhone.slice(1, 11)}`)
  const payload = {
    messages: [
      {
        from: "InfoSender", // Replace with your registered alphanumeric sender ID or Infobip-provided number
        destinations: [
          {
            to: `+234${recipientPhone.slice(1, 11)}`, // Replace with the recipient's phone number
          },
        ],
        text: `Your OTP code is: ${otpCode}. It is valid for 10 minutes.`,
      },
    ],
  };

  try {
    const response = await axios.post(
      `${API_BASE_URL}/sms/2/text/advanced`,
      payload,
      {
        headers: {
          Authorization: `App ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`Message sent successfully to ${recipientPhone}:`, response.data);
  } catch (error) {
    console.error(`Error sending message to ${recipientPhone}:`, error.response?.data || error.message);
  }
};

