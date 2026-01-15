const axios = require('axios');
require('dotenv/config');

/**
 * Generate a token for authentication
 * @async
 * @function generateToken
 * @returns {Promise<string>} The authentication token
 */
async function generateToken() {
    try {
        const baseUrl = process.env.TELCO_SWITCH_IP;
        const endpoint = 'v1/switch-bus/login';
        
        const requestBody = {
            username: process.env.UBA_API_USERNAME || "meekfi",
            password: process.env.UBA_API_PASSWORD || "passwordformeekfi"
        };
        
        const response = await axios.post(`${baseUrl}/${endpoint}`, requestBody, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000 // 10 seconds timeout
        });
        
        if (response.data && response.data.status && response.data.data && response.data.data.token) {
            return response.data.data.token;
        } else {
            throw new Error('Failed to generate token: Invalid response format');
        }
    } catch (error) {
        console.error('Token generation failed:', error.message);
        throw error;
    }
}

/**
 * Get authorization headers with token
 * @async
 * @function getAuthHeaders
 * @returns {Promise<Object>} Headers object with token
 */
async function getAuthHeaders() {
    try {
        const token = await generateToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    } catch (error) {
        console.error('Failed to get auth headers:', error.message);
        throw error;
    }
}

async function validateAccountNumber(walletId, country, account) {
    try {
        const service = 'uba-esb';
        const baseUrl = process.env.TELCO_SWITCH_IP;
        const endpoint = `v1/switch-bus/get-user-details/${country}/${service}/${account}`;
        
        // Get headers with token
        const headers = await getAuthHeaders();
        
        // Make API call with the token in headers
        const response = await axios.get(`${baseUrl}/${endpoint}`, {
            headers,
            timeout: 30000
        });

        console.log("response from UBA ESB", response.data);

        const responseMessage = response.data;

        console.log("account details", responseMessage.data.accountInfo);

        let phoneNo = responseMessage.data.accountInfo.phoneNumber;
        phoneNo = walletId;

        if((responseMessage.status == true) && (walletId == phoneNo)){
            console.log("response from UBA ESB", response.data);
            return response.data;
        } else {
            console.log("Account Could Not Be Validated");
            return "Account Could Not Be Validated";
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function uba2ubaTransfer(amount, sender, receiver, walletId, country, transactionId, narration) {
    const service = 'uba-esb';
    const baseUrl = process.env.TELCO_SWITCH_IP;

    const requestBody = {
        serviceType: service,
        fromAccount: sender,
        toAccount: receiver,
        merchantName: "USSD Merchant",
        amount: (amount),
        country: country,
        reference: transactionId,
        fee: "0",
        narration: narration
    };

    console.log("this is the request body -->", requestBody);

    try {
        // Get headers with token
        const headers = await getAuthHeaders();
        
        const response = await axios.post(`${baseUrl}/v1/switch-bus/account-to-account-transfer`, requestBody, {
            headers,
            timeout: 20000
        });

        console.log("UBA to UBA Transaction response", response.data);
        return response.data;
    } catch (error) {
        console.error(error.data);
        throw error;
    }
}

async function checkAccountBalance(account, country){
    const service = 'uba-esb';
    const baseUrl = process.env.TELCO_SWITCH_IP;
    const endpoint = `v1/switch-bus/get-balance/${country}/${service}/${account}`;

    try {
        // Get headers with token
        const headers = await getAuthHeaders();
        
        const response = await axios.get(`${baseUrl}/${endpoint}`, {
            headers,
            timeout: 30000
        });

        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function getMiniStatement(account, country){
    try {
        const service = 'uba-esb';
        const baseUrl = process.env.TELCO_SWITCH_IP;
        const endpoint = `v1/switch-bus/get-mini-statement/${country}/${service}/${account}`;
        
        // Get headers with token
        const headers = await getAuthHeaders();
        
        const response = await axios.get(`${baseUrl}/${endpoint}`, {
            headers,
            timeout: 30000
        });

        console.log("response from UBA ESB", response.data);
        const responseMessage = response.data;
        console.log("mini statement details", responseMessage.data.transactions);

        let transactionData = responseMessage.data.transactions;
        const firstFiveTransactions = transactionData.slice(0, 2);
        
        if(responseMessage.status == true){
            console.log("display first 5 transactions", firstFiveTransactions);
            return firstFiveTransactions;
        } else {
            console.log("Could not get Mini-statement");
            return "No Mini-statement";
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function validateCardDetails(pan, accountno, msisdn){
    const requestBody = {
        bank_id: "BJ",
        acct: accountno,
        pan: pan,
        phone: msisdn
    };

    try {
        const baseUrl = process.env.UBA_CARD_ENDPOINT_URL;
        const endpoint = `/PANValidate/process/mock`;

        // Get headers with token
        const headers = await getAuthHeaders();
        
        const response = await axios.post(`${baseUrl}${endpoint}`, requestBody, {
            headers,
            timeout: 20000
        });

        console.log("response from UBA ESB", response.data);
        const responseMessage = response.data;

        if(responseMessage.status == true){
            console.log("Card validated successfully");
            return response.data;
        } else {
            console.log("Card Could Not Be Validated");
            return "Card Could Not Be Validated";
        }
    } catch(err) {
        console.error("Card validation error:", err);
        throw err;
    }
}

// For caching token to avoid unnecessary requests
let tokenCache = {
    token: null,
    expiryTime: null
};

/**
 * Get token with caching
 * @async
 * @function getCachedToken
 * @returns {Promise<string>} The cached or newly generated token
 */
async function getCachedToken() {
    const now = Date.now();
    
    // If token exists and is not expired (giving 30 seconds buffer)
    if (tokenCache.token && tokenCache.expiryTime && tokenCache.expiryTime > now + 30000) {
        return tokenCache.token;
    }
    
    // Otherwise, get a new token
    const token = await generateToken();
    
    // Parse JWT to get expiry
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        
        if (payload.exp) {
            // Set token in cache with expiry time
            tokenCache = {
                token,
                expiryTime: payload.exp * 1000  // Convert to milliseconds
            };
        }
    }
    
    return token;
}

module.exports = {
    generateToken,
    validateAccountNumber,
    uba2ubaTransfer,
    checkAccountBalance,
    getMiniStatement,
    validateCardDetails
};