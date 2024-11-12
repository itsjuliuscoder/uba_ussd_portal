const crypto = require('crypto');
const cryptoJS = require('crypto-js');

require('dotenv/config');

// Function to create a SHA-256 hash
function createSHA256Hash(data) {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

// Function to generate SHA-1 hash
function generateSHA1(input) {
  const hash = crypto.createHash('sha1');
  hash.update(data);
  return hash.digest('hex');
}

function generateRandomString(length) {
  const possibleCharacters = 'abcdefghijklm0123456789';
  const bytes = crypto.randomBytes(length);
  let result = '';
  
  for (let i = 0; i < bytes.length; i++) {
    result += possibleCharacters.charAt(bytes[i] % possibleCharacters.length);
  }
  
  return result;
}

const salt = "43f7d19b40c245d7a3546fb7bb17dc9f15573359"; //generateRandomString(40); //"43f7d19b40c245d7a3546fb7bb17dc9f15573359"; //generateRandomString(30);
const data = 'Hello, World!';
const password = process.env.SOCHITEL_PASSWORD;
const payload =salt+generateSHA1(password)
const parsed = generateSHA1(payload);
const salt2 = generateSHA1(password);
const encryptedD = salt+salt2;
const data2 = generateSHA1(encryptedD);
//const data3 = generateSHA1(data2);
// const hash = createSHA256Hash(data);
// const sha1 = generateSHA1(data2)

console.log(`Password "${password}" and it is encrypted is: ${salt2}`);
console.log(`This is the ${salt}, this is the data to be encrypted ${encryptedD} and the hashed password ${parsed}`);


