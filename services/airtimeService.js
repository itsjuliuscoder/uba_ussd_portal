const axios = require('axios');
const crypto = require('crypto');
const cryptoJS = require('crypto-js');
require('dotenv/config');
const NetworkOperator = require("../database/models");
const User = require("../database/models")
const Sequelize = require("sequelize");
const Op = Sequelize.Op;


/*
*   
*   
*   
*/
const generateHashedPassword = async(requestId) => {

    let sha1PlainPassword = cryptoJS.SHA1(password).toString();
    console.log("Plain password SHA1: " + sha1PlainPassword);

    let passwordHash = cryptoJS.SHA1(salt + sha1PlainPassword).toString();
    console.log("Plain password SHA1: " + passwordHash);

    return passwordHash;

}

const getOperators = async(operatorId) => {

    try {

        const body = {
            "operatorId": operatorId
        };

        let url = `${process.env.VAS_URL}/v1/switch-bus/get-operators`;

        const response = await axios.post(url, body, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 3000
        });

        console.log("This is the response for getOperators --> ", response.data);

        return response.data.data.result;

    } catch(e){

        console.error("this is the error -->", e);
    
    }

}

const getOperatorProducts = async(operatorId, productId) => {
    try {

        const body = {
            operatorId: JSON.stringify(operatorId),
            productType: JSON.stringify(productId)
        };

        let url = `${process.env.VAS_URL}/v1/switch-bus/get-operator-products`

        const response = await axios.post(url, body, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 3000
        })

        console.log("this is the response --> ", response);

        return response.data.data;

    } catch (e) {

        console.error("this is the error ", e);
        
    }
}

const execTransaction = async(operatorId, productId, amount, msisdn, transactionId) => {

    try {

        const body = {
            "operator": operatorId,
            "productId": productId,
            "amountOperator": amount,
            "msisdn": msisdn,
            "accountId": "",
            "userReference": transactionId,
            "simulate": false
        }

        let url = `${process.env.VAS_URL}/v1/switch-bus/get-operator-products`

        const response = await axios.post(url, body, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 3000
        })

        console.log("this is the response --> ", response); 

        return response

    } catch(e) {
        console.log(e)
    }
    
}

const purchaseAirtime = async(wallet_id, walletId, amount, country, transactionId) => {

    
    // also need to cache 
    
    let getOperatorId = await getOperators(wallet_id); 

    let getOperatorProd = await getOperatorProducts(wallet_id, product_id="1");

    let purchaseResp = await execTransaction(wallet_id, product="1", amount, walletId, country="BENIN-REPUBLIC", transactionId);

    console.log("this is the purchase response -->", purchaseResp);
    // need to declare a queue to enable 
    if(purchaseResp == true){

    }

}

const msisdnLookUp = async(phone) => {

    try {

    } catch (e) {

    }

}

const dataProducts = async () => {

}


module.exports = {
    execTransaction,
    getOperatorProducts,
    getOperators,
    generateHashedPassword,
    dataProducts,
    msisdnLookUp,
    purchaseAirtime
}