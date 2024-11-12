const axios = require('axios');
const { CardlessTrans } = require('../database/models');
const Sequelize = require('sequelize');
const crypto = require('crypto');
require('dotenv/config');
//const got = require('got');
//const got = await import('got');
// import got from 'got';


const generateToken = async() => {
    try {

        const baseUrl = process.env.CARDLESS_URL;

        const request_body = {
            "countryCode": "BJ"
        }

        const username = process.env.CARDLESS_USERNAME;
        const password = process.env.CARDLESS_PASSWORD;

        console.log("username -->", username)
        console.log("username -->", password)
        
        //encode in base64 
        const encodedCredentials = Buffer.from(`${username}:${password}`).toString('base64');


        const response = await axios.post(`${baseUrl}/atm/v1/generate_token`, request_body, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${encodedCredentials}`,
            }
        });

        console.log("this is the response data -->", response.data);

        return response.data;

    } catch(e){
        
        console.log("this is the error from generate token-->", e);


    }

}

const generatePaycode = async(requestId, wallet, walletId, amount, tempPin) => {

    try {

        const username = process.env.CARDLESS_USERNAME;
        const password = process.env.CARDLESS_PASSWORD;
        
        //encode in base64 
        const encodedCredentials = Buffer.from(`${username}:${password}`).toString('base64');

        const getToken = await generateToken();

        const token = await getToken.accessToken;

        console.log("encodedCredentials -->", encodedCredentials);

        console.log("this is the generated token ---> ", getToken.accessToken);

        const baseUrl = process.env.CARDLESS_URL;

        const request_body = {
            "requestId": requestId, 
            "wallet": process.env.CARDLESS_USERNAME,
            "walletId": walletId,
            "amount": amount,
            "tempPin": tempPin,
            "callbackUrl": process.env.CALLBACK_URL
        }

        const response = await axios.post(`${baseUrl}/atm/v1/generate_paycode`, request_body, {
            headers: {
                'Authorization': `Basic ${encodedCredentials}`,
                'Content-Type': 'application/json',
                'access_token': `${token}`
            },
            timeout: 5000
        });

        console.log("response gotten from generating paycode -->", response.data);

        return response.data;

    } catch(err) {

        console.log("this is the generated paycode error ", err);

        return err;

    }

}

const listPaycode = async(walletId) => {

    try { 

        const checkPaycode = await CardlessTrans.findAll({
            where: { walletId: walletId, status: "processing" }
        });
    
        console.log("this is the checkPaycode response -->", checkPaycode);
    
        if(checkPaycode != []){
            return checkPaycode;
        } else {
            return false;
        }

    } catch(err){

        console.log("checkPaycode error -->", err);

        throw err;
    }

}

const iniTransaction = async() => {}

const completeTransaction = async() => {}

const expirePaycode = async() => {}

const cancelPaycode = async() => {}


module.exports = {
    generatePaycode,
    generateToken,
    listPaycode,
    iniTransaction,
    completeTransaction,
    cancelPaycode
}