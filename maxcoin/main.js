/* const CoinAPI = require("./services/CoinAPI"); */
const MongoBackend = require("./services/backend/MongoBackend");

async function run() {
  const mongoBackend = new MongoBackend();
  /* const coinAPI = new CoinAPI();
  return coinAPI.fetch(); */
  return mongoBackend.max();
}

run()
  .then((result) => {
    console.log(result);
  })
  .catch((err) => console.error(err));
