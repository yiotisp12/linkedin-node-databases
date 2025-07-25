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

  async getMax() {
    return this.collection.findOne({}, { sort: { value: 1 } });
  }

  async max() {
    console.info("Connecting to MongoDB...");
    console.time("mongodb-connect");
    await this.connect();
    console.info("Successfully connected to MongoDB");
    console.timeEnd("mongodb-connect");

    console.info("Inserting into MongoDB...");
    console.time("mongodb-insert");
    const insertResult = await this.insert();
    console.timeEnd("mongodb-insert");

    console.info(
      `Inserted ${insertResult.insertedCount} documents into MongoDB`
    );

    console.info("Querying MongoDB...");
    console.time("mongodb-find");
    const doc = await this.getMax();
    console.timeEnd("mongodb-find");

    console.info("Disconnecting from MongoDB...");
    console.time("mongodb-disconnect");
    await this.disconnect();
    console.timeEnd("mongodb-disconnect");

    return {
      date: doc.date,
      value: doc.value,
    };
  }
}

module.exports = MongoBackend;
