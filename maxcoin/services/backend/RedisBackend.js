/* eslint-disable no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */

const Redis = require("ioredis");

const CoinAPI = require("../CoinAPI");

class RedisBackend {
  constructor() {
    this.coinAPI = new CoinAPI();
    this.client = null;
  }

  connect() {
    this.client = new Redis(7379);
    return this.client;
  }

  async disconnect() {
    return this.client.disconnect();
  }

  async insert() {
    const data = await this.coinAPI.fetch();
    const values = [];
    const items =
      data && data.Data && Array.isArray(data.Data.Data) ? data.Data.Data : [];
    items.forEach((item) => {
      values.push(item.close); // score
      values.push(new Date(item.time * 1000).toISOString().slice(0, 10)); // member
    });
    return this.client.zadd("maxcoin:values", values);
  }

  async getMax() {
    return this.client.zrange("maxcoin:values", -1, -1, "WITHSCORES");
  }

  async max() {
    console.info("Connecting to Redis...");
    console.time("redis-connect");
    this.connect();
    console.info("Successfully connected to Redis");
    console.timeEnd("redis-connect");

    console.info("Inserting into Redis...");
    console.time("redis-insert");
    const insertResult = await this.insert();
    console.timeEnd("redis-insert");

    console.info(`Inserted ${insertResult} documents into Redis`);

    console.info("Querying Redis...");
    console.time("redis-find");
    const result = await this.getMax();
    console.timeEnd("redis-find");

    console.info("Disconnecting from Redis...");
    console.time("redis-disconnect");
    await this.disconnect();
    console.timeEnd("redis-disconnect");
    return result;
  }
}

module.exports = RedisBackend;
