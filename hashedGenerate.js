const crypto = require('crypto');

// Function to create a SHA-256 hash
function createSHA256Hash(data) {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

const data = 'Hello, World!';
const hash = createSHA256Hash(data);

console.log(`SHA-256 hash of "${data}" is: ${hash}`);


