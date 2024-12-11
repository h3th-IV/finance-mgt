const axios = require('axios');
require("dotenv").config();

const baseURL = process.env.NVB_URL;
const token = process.env.NVB_YEK;

const headers = {
    "token": `${token}`,
    "Content-Type": "application/json"
};
console.log(headers);

/**
 * verify BVN --uVerify  @p1
 * @param {string} bvn -the Bank Verification Number to verify
 * @returns {Promise<Object>} -the response payload from the API
 * @throws {Error} -trows error if API call fails
 */
async function verifyBVN(bvn) {
    if (!bvn) {
        throw new Error('BVN is required to perform verification');
    }

    const body = {
        id: bvn,
        metadata: {
            requestId: `req-${Date.now()}`
        },
        isSubjectConsent: true,
        premiumBVN: false
    };

    try {
        const response = await axios.post(baseURL, body, { headers });
        return response.data;//return data only
    } catch (error) {
        const errorDetails = error.response ? error.response.data : error.message;
        console.error('Error verifying BVN:', errorDetails);
        throw new Error(`BVN Verification failed: ${errorDetails}`);
    }
}



module.exports = verifyBVN;
