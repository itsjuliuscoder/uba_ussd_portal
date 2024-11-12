const redis = require('redis');
const bull = require('bull');
require('dotenv/config');





// Create Redis Client 
const redisClient = redis.createClient({
    host: process.env.QUEUE_HOST,
    port: process.env.QUEUE_PORT
});

