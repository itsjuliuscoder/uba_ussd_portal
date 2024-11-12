const cryptoJS = require('crypto-js');

require('dotenv/config');


const password = process.env.SOCHITEL_PASSWORD;
let salt = generateRandomValues(30);
console.log("This is the salt value: " + salt);

let sha1PlainPassword = cryptoJS.SHA1(password).toString();
console.log("Plain password SHA1: " + sha1PlainPassword);

var passwordHash = cryptoJS.SHA1(salt + sha1PlainPassword).toString();

console.log("Hash is " + passwordHash);

function generateRandomValues(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

