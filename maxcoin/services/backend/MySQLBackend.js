/* eslint-disable no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */
const mysql = require("mysql2/promise");
const CoinAPI = require("../CoinAPI");

class MySQLBackend {
  constructor() {
    this.coinAPI = new CoinAPI();
    this.connection = null;
  }

  async connect() {
    this.connection = await mysql.createConnection({
      host: "localhost",
      port: 3406,
      user: "root",
      password: "mypassword",
      database: "maxcoin",
    });
    return this.connection;
  }

  async disconnect() {
    return this.connection.end();
  }

  async insert() {
    const data = await this.coinAPI.fetch();
    const sql = "INSERT INTO coinvalues (valuedate, coinvalue) VALUES ?";
    const values = [];
    data.Data.Data.forEach((item) => {
      const date = new Date(item.time * 1000).toISOString().slice(0, 10); // "YYYY-MM-DD"
      values.push([date, item.close]);
    });
    return this.connection.query(sql, [values]);
  }

  async getMax() {
    return this.connection.query(
      "SELECT * FROM coinvalues ORDER by coinvalue DESC LIMIT 0,1"
    );
  }

  async max() {
    console.info("Connecting to MySQL...");
    console.time("mysql-connect");
    this.connect();
    console.info("Successfully connected to MySQL");
    console.timeEnd("mysql-connect");

    console.info("Inserting into MySQL...");
    console.time("mysql-insert");
    const insertResult = await this.insert();
    console.timeEnd("mysql-insert");

    console.info(
      `Inserted ${insertResult[0].affectedRows} documents into MySQL`
    );

    console.info("Querying MySQL...");
    console.time("mysql-find");
    const result = await this.getMax();
    const row = result[0][0];
    console.timeEnd("mysql-find");

    console.info("Disconnecting from MySQL...");
    console.time("mysql-disconnect");
    await this.disconnect();
    console.timeEnd("mysql-disconnect");
    return row;
  }
}

module.exports = MySQLBackend;
