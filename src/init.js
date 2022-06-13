const { createClient } = require('redis');
const wtf = require('wtf-lib')
require('dotenv').config();


if (process.env.WTF_USE_TEST_CONTRACT_ADDRESSES == "true") {
  wtf.setProviderURL({ 'default' : 'http://localhost:8545'})
}
else {
  wtf.setProviderURL({ 
    'gnosis' : 'https://rpc.gnosischain.com/',
    'mumbai' : process.env.MORALIS_NODE 
  })
}

const redisClient = createClient();
redisClient.connect().then(val => console.log('Connected to redis db on port 6379'))
process.on('SIGTERM', async () => await redisClient.quit());


module.exports = {
  redisClient: redisClient,
  wtf: wtf,
}
