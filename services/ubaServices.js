const axios = require('axios');


async function validatePhoneNumber(phoneNumber, country, account) {
    try {

        const service = 'uba-esb'
        const baseUrl = process.env.TELCO_SWITCH_URL
        const endpoint = `v1/switch-bus/get-user-details/${country}/${service}/${account}`;

        // generate an asynchronous axios get call with the appropriate headers
        const response = await axios.get(`${baseUrl}/${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        return response.data;
        console.log("response", response.data); // log the response data to the console

    } catch (error) {
        // Handle any errors here
        console.error(error);
        throw error;
    }
}

async function uba2ubaTransfer(amount, recipient, sender, walletId, country) {

    const service = 'uba-esb';
    const baseUrl = process.env.TELCO_SWITCH_URL;

    const requestBody = {
        serviceType: service,
        msisdn: recipient,
        amount: amount,
        sender: sender,
        country: country,
    }

    
    

    try {
        
        const response = await axios.post(`${baseUrl}/v1/switch-bus/account-to-account-transfer`, {
            amount,
            recipient,
            sender,
            walletId,
            service
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        return response.data;

        // Process the response data here
        console.log(response.data);

        return response.data;
    } catch (error) {
        // Handle any errors here
        console.error(error);
        throw error;
    }
}


async function checkAccountBalance(account){

    const service = 'uba-esb';
    const baseUrl = process.env.TELCO_SWITCH_URL;
    const endpoint = `v1/switch-bus/get-balance/${country}/${service}/${account}`;

    try {
        const response = await axios.get(`${baseUrl}/${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Process the response data here
        console.log(response.data);

        return response.data;
    } catch (error) {
        // Handle any errors here
        console.error(error);
        throw error;
    }
}


async function miniStatement(account){
    try {
        const response = await axios.post('https://bank-core-api.com/miniStatement', {
            account
        }, {
            headers: {
                Authorization: 'Bearer YOUR_AUTH_TOKEN'
            }
        });

        // Process the response data here
        console.log(response.data);
    } catch (error) {
        // Handle any errors here
        console.error(error);
        throw error;
    }

}



module.exports = {
    validatePhoneNumber,
    uba2ubaTransfer,
    checkAccountBalance,
}; 
