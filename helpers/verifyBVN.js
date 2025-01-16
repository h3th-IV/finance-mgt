const axios = require('axios');
require("dotenv").config();

const baseURL = process.env.NVB_URL;
const token = process.env.NVB_YEK;

const headers = {
    "token": `${token}`,
    "Content-Type": "application/json"
};
// console.log(headers);

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
        premiumBVN: true
    };

    try {
        const response = await axios.post(baseURL, body, { headers });
        // console.log(response.data);
        return response.data; //on success retunr data
    } catch (error) {
        const errorResponse = error.response?.data;

        if (errorResponse) {
            switch (errorResponse.statusCode) {
                case 402:
                    throw {
                        statusCode: 402,
                        text: "insufficient funds. Please top up your account",
                        message: "We are currently unable to complete your request. Please try again later.",
                    };

                case 403:
                    throw {
                        statusCode: 403,
                        text: "permission error, check access token",
                        message: "We are unable to verify your information at the moment. Please contact support for assistance.",
                    };

                case 503:
                    throw {
                        statusCode: 503,
                        message: "Third-party service is currently unavailable. Please try again later.",
                    };
                case 500:
                    throw {
                        statusCode: 500,
                        message: "Internal server error. Please contact support.",
                    };
                default:
                    throw {
                        statusCode: errorResponse.statusCode || 500,
                        message: errorResponse.message || "An unknown error occurred during BVN verification.",
                    };
            }
        } else {
            throw {
                statusCode: 500,
                message: error.message || "An unexpected error occurred during BVN verification.",
            };
        }
    }
}


// verifyBVN('22412725674')
module.exports = verifyBVN;
