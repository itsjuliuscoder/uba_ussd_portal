const axios = require('axios');
require('dotenv/config');


async function validateAccountNumber(walletId, country, account) {
    try {

        const service = 'uba-esb'
        const baseUrl = process.env.TELCO_SWITCH_IP
        const endpoint = `v1/switch-bus/get-user-details/${country}/${service}/${account}`;

        // generate an asynchronous axios get call with the appropriate headers
        const response = await axios.get(`${baseUrl}/${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000 // Timeout of 10 seconds (10000 milliseconds)

        });

        console.log("response from UBA ESB", response.data);

        const responseMessage = response.data;

        console.log("account details", responseMessage.data.accountInfo)

        let phoneNo = responseMessage.data.accountInfo.phoneNumber;
        phoneNo = walletId;

        if((responseMessage.status == true) && (walletId == phoneNo)){
            console.log("response from UBA ESB", response.data); // log the response data to the console

            return response.data;
        } else {
            console.log("Account Could Not Be Validated");
            
            return "Account Could Not Be Validated";
        }

    } catch (error) {
        // Handle any errors here
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
    }

    console.log("this is the request body -->", requestBody)

    

    try {
        
        const response = await axios.post(`${baseUrl}/v1/switch-bus/account-to-account-transfer`, requestBody, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 20000 // Timeout of 20 seconds (20000 milliseconds)
        });

        // Process the response data here
        console.log("UBA to UBA Transaction response", response.data);

        return response.data;

    } catch (error) {
        // Handle any errors here
        console.error(error.data);
        //throw error;
    }
}


async function checkAccountBalance(account, country){

    const service = 'uba-esb';
    const baseUrl = process.env.TELCO_SWITCH_IP;
    const endpoint = `v1/switch-bus/get-balance/${country}/${service}/${account}`;

    try {
        const response = await axios.get(`${baseUrl}/${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000 // Timeout of 10 seconds (10000 milliseconds)
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


async function getMiniStatement(account, country){
    try {
        const service = 'uba-esb'
        const baseUrl = process.env.TELCO_SWITCH_IP
        const endpoint = `v1/switch-bus/get-mini-statement/${country}/${service}/${account}`;
        
        // generate an asynchronous axios get call with the appropriate headers
        const response = await axios.get(`${baseUrl}/${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000 // Timeout of 10 seconds (10000 milliseconds)

        });

        console.log("response from UBA ESB", response.data);

        const responseMessage = response.data;

        console.log("mini statement details", responseMessage.data.transactions)

        let transactionData = responseMessage.data.transactions; // Use the slice method to get the first 5 items
        
        const firstFiveTransactions = transactionData.slice(0, 2);
        
        if((responseMessage.status == true)){
            console.log("display first 5 transactions", firstFiveTransactions); // log the response data to the console

            return firstFiveTransactions;

        } else {
            console.log("Could not get Mini-statement");

            return "No Mini-statement";
        }
    } catch (error) {
        // Handle any errors here
        console.error(error);
        throw error;
    }

}




module.exports = {
    validateAccountNumber,
    uba2ubaTransfer,
    checkAccountBalance,
    getMiniStatement
}; 
