/* eslint-disable no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */

const { MongoClient } = require("mongodb");

const CoinAPI = require("../CoinAPI");

class MongoBackend {
  constructor() {
    this.coinAPI = new CoinAPI();
    this.mongoUrl = "mongodb://localhost:37017/maxcoin";
    this.client = null;
    this.collection = null;
  }

  async connect() {
    const mongoClient = new MongoClient(this.mongoUrl, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    this.client = await mongoClient.connect();
    this.collection = this.client.db("maxcoin").collection("values");
    return this.client;
  }

  async disconnect() {
    if (this.client) {
      return this.client.close();
    }
    return false;
  }

  async insert() {
    const data = await this.coinAPI.fetch();
    const documents = [];
    const items =
      data && data.Data && Array.isArray(data.Data.Data) ? data.Data.Data : [];
    items.forEach((item) => {
      documents.push({
        date: new Date(item.time * 1000).toISOString().slice(0, 10),
        value: item.close,
      });
    });
    if (documents.length === 0) {
      throw new Error("No data to insert into MongoDB.");
    }
    return this.collection.insertMany(documents);
  }

  // This function is not used in the current implementation, but can be used to insert data.
  /* async insert() {
    const data = await this.coinAPI.fetch();
    const documents = [];
    Object.entries(data.bpi).forEach((entry) => {
      documents.push({
        date: entry[0],
        value: entry[1],
      });
    });
    return this.collection.insertMany(documents);
  } */

  async getMax() {}

  async max() {
    console.info("Connecting to MongoDB...");
    console.time("mongodb-connect");
    /* const client = await this.connect(); !ORIGINAL CODE IS OUTDATED DOESNT WORK!
    if (client.isConnected()) {
      console.info("Successfully connected to MongoDB");
    } else {
      throw new Error("Failed to connect to MongoDB");
    }
    console.timeEnd("mongodb-connect"); */
    await this.connect();
    console.info("Successfully connected to MongoDB");
    console.timeEnd("mongodb-connect");

    console.info("Inserting into MongoDB...");
    console.time("mongodb-insert");
    const insertResult = await this.insert();
    console.timeEnd("mongodb-insert");
    // npm start for Inserting => TypeError: Cannot convert undefined or null to object
    console.info(
      `Inserted ${insertResult.insertedCount} documents into MongoDB`
    );
    // Changed api url in CoinAPI.js but copied data manually from the original...
    // API to follow instructions in data.json, see CoinAPI.js for more info.
    console.info("Disconnecting from MongoDB...");
    console.time("mongodb-disconnect");
    await this.disconnect();
    console.timeEnd("mongodb-disconnect");
  } // Due to the data fetch mismatch, this function won't work as expected.
} // 3. Use Document Databases with Node.js - Part 4: Insert data into MongoDB
// This course was created in 2021, following along getting increasingly difficult.

module.exports = MongoBackend;
