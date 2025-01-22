const axios = require("axios");
require("dotenv").config();

const API_BASE_URL = "https://uat.firstcentralcreditbureau.com/firstcentralrestv2";
const USERNAME = process.env.TSRIF_LARTNEC_USERNAME;
const PASSWORD = process.env.TSRIF_LARTNEC__PASSWORD;

let dataTicket = null;


async function authenticate() {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, {
            username: USERNAME,
            password: PASSWORD
        }, {
            headers: { "Content-Type": "application/json" }
        });
        console.log(response);
        const [data] = response.data;
        dataTicket = data.DataTicket;
        return dataTicket;
    } catch (error) {
        console.error("Error during authentication:", error.response?.data || error.message);
        throw new Error("Failed to authenticate with FirstCentral API.");
    }
}


async function getDataTicket() {
    if (!dataTicket) {
        dataTicket = await authenticate();
    }
    return dataTicket;
}

async function matchConsumer(consumerDetails) {
    // const ticket = await getDataTicket() || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW8iLCJwYXNzd29yZCI6ImRlbW9AMTIzIiwiaWF0IjoxNzM3NTQwNTQ2LCJleHAiOjE3NTU1NDA1NDZ9.wS6iaTEt1paKT1mvGAFYXj8Hfz5M1zHgYAwdQZF7D0s";

    const ticket = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW8iLCJwYXNzd29yZCI6ImRlbW9AMTIzIiwiaWF0IjoxNzM3NTQwNTQ2LCJleHAiOjE3NTU1NDA1NDZ9.wS6iaTEt1paKT1mvGAFYXj8Hfz5M1zHgYAwdQZF7D0s";

    try {
        const response = await axios.post(`${API_BASE_URL}/connectConsumerMatch`, {
            DataTicket: ticket,
            ...consumerDetails
        }, {
            headers: { "Content-Type": "application/json" }
        });
        return response.data[0].MatchedConsumer;
    } catch (error) {
        console.error("Error during consumer matching:", error.response?.data || error.message);
        throw new Error("Failed to match consumer.");
    }
}


async function matchCommercial(commercialDetails) {
    // const ticket = await getDataTicket() || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW8iLCJwYXNzd29yZCI6ImRlbW9AMTIzIiwiaWF0IjoxNzM3NTQwNTQ2LCJleHAiOjE3NTU1NDA1NDZ9.wS6iaTEt1paKT1mvGAFYXj8Hfz5M1zHgYAwdQZF7D0s";

    const ticket = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW8iLCJwYXNzd29yZCI6ImRlbW9AMTIzIiwiaWF0IjoxNzM3NTQwNTQ2LCJleHAiOjE3NTU1NDA1NDZ9.wS6iaTEt1paKT1mvGAFYXj8Hfz5M1zHgYAwdQZF7D0s";

    try {
        const response = await axios.post(`${API_BASE_URL}/connectCommercialMatch`, {
            DataTicket: ticket,
            ...commercialDetails
        }, {
            headers: { "Content-Type": "application/json" }
        });
        return response.data[0]?.ConnectCommercialMatch || [];
    } catch (error) {
        console.error("Error during commercial matching:", error.response?.data || error.message);
        throw new Error("Failed to match commercial entity.");
    }
}


async function generateConsumerReport(reportDetails) {
    // const ticket = await getDataTicket() || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW8iLCJwYXNzd29yZCI6ImRlbW9AMTIzIiwiaWF0IjoxNzM3NTQwNTQ2LCJleHAiOjE3NTU1NDA1NDZ9.wS6iaTEt1paKT1mvGAFYXj8Hfz5M1zHgYAwdQZF7D0s";

    const ticket = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW8iLCJwYXNzd29yZCI6ImRlbW9AMTIzIiwiaWF0IjoxNzM3NTQwNTQ2LCJleHAiOjE3NTU1NDA1NDZ9.wS6iaTEt1paKT1mvGAFYXj8Hfz5M1zHgYAwdQZF7D0s";

    try {
        const response = await axios.post(`${API_BASE_URL}/GetConsumerFullCreditReport`, {
            DataTicket: ticket,
            ...reportDetails
        }, {
            headers: { "Content-Type": "application/json" }
        });
        return response
    } catch (error) {
        console.error("Error during report generation:", error.response?.data || error.message);
        throw new Error("Failed to generate report.");
    }
}

async function generateBusinessReport(reportDetails) {
    // const ticket = await getDataTicket() || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW8iLCJwYXNzd29yZCI6ImRlbW9AMTIzIiwiaWF0IjoxNzM3NTQwNTQ2LCJleHAiOjE3NTU1NDA1NDZ9.wS6iaTEt1paKT1mvGAFYXj8Hfz5M1zHgYAwdQZF7D0s";

    const ticket = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW8iLCJwYXNzd29yZCI6ImRlbW9AMTIzIiwiaWF0IjoxNzM3NTQwNTQ2LCJleHAiOjE3NTU1NDA1NDZ9.wS6iaTEt1paKT1mvGAFYXj8Hfz5M1zHgYAwdQZF7D0s";
    try {
        const response = await axios.post(`${API_BASE_URL}/GetCommercialFullCreditReport`, {
            DataTicket: ticket,
            ...reportDetails
        }, {
            headers: { "Content-Type": "application/json" }
        });
        return response
    } catch (error) {
        console.error("Error during report generation:", error.response?.data || error.message);
        throw new Error("Failed to generate report.");
    }
}

module.exports = {
    authenticate,
    matchConsumer,
    matchCommercial,
    generateConsumerReport,
    generateBusinessReport
};