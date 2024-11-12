const axios = require('axios');
const crypto = require('crypto');
const cryptoJS = require('crypto-js');
require('dotenv/config');
const NetworkOperator = require("../database/models");
const User = require("../database/models")
const Sequelize = require("sequelize");
const Op = Sequelize.Op;



const fundMobileWallet = async (msisdn, amount, transactionId) => {
    
    try {

        const service = 'mtn';
        const baseUrl = process.env.TELCO_SWITCH_IP;

        let url = `/v1/switch-bus/credit-account`

        const requestBody = {
            serviceType: service,
            msisdn: msisdn,
            merchantName: "UBA USSD Merchant",
            amount: (amount),
            currency: "EUR",
            externalId: transactionId,
            reference: transactionId + "UBAB2W"
        };

        console.log("this is the request body -->", requestBody);

        const response = await axios.post(`${baseUrl}${url}`, requestBody, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 20000 // Timeout of 20 seconds (20000 milliseconds)
        });

        // Process the response data here
        console.log("Fund Wallet Request --->", response.data);

        return response.data
        
    } catch (err) {
        // Handle any errors here
        console.error(error);
        throw error;
    }
}

const validateWallet = async (wallet, country, account) => {
    try {
        
        const service = wallet;
        const baseUrl = process.env.TELCO_SWITCH_IP
        const endpoint = `v1/switch-bus/get-user-details/${country}/${service}/${account}`;

        // generate an asynchronous axios get call with the appropriate headers
        const response = await axios.get(`${baseUrl}/v1/switch-bus/get-user-details/${country}/${service}/${account}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000 // Timeout of 10 seconds (10000 milliseconds)

        });

        console.log("response from telco switch bus", response.data);

        return response.data;

    } catch(err) {
        // Handle any errors here
        console.error(err);
        throw err;
    }
}

module.exports = {
    fundMobileWallet,
    validateWallet
}; 