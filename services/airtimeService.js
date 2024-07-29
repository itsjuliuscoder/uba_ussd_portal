const axios = require('axios');
const crypto = require('crypto');


const generateHashedPassword = async(requestId) => {

    

}

const getOperators = async(salt) => {

    try {
        
        let password = process.env.SOCHITEL_PASSWORD;

        const body = {
            "auth": {
                "username": process.env.SOCHITEL_USERNAME,
                "salt": "",
                "password": password,
                "signature": ""
            }, 
            "version": "5",
            "command": "getOperators"
        };

        //let url = `${process.env.SOCHITEL_URL}/`

        const response = axios.post(process.env.SOCHITEL_URL, body, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log("This is the response for getOperators --> ", response);

    } catch(e){

        console.error("this is the error -->", e);
    
    }

}

const getOperatorProducts = async() => {

}

const execTransaction = async() => {

}

// Function to create a SHA-256 hash
function createSHA256Hash(data) {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}

module.exports = {
    execTransaction,
    getOperatorProducts,
    getOperators,
    generateHashedPassword
}