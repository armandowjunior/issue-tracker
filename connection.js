"use strict";

require("dotenv").config();
const { MongoClient } = require("mongodb");

async function main(callback) {
  const URI = process.env.DB;
  const client = new MongoClient(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }); // Instance of MongoClient

  try {
    await client.connect(); // returns a promise based on the status of the connection to the DB;

    await callback(client);
  } catch (e) {
    console.error(e);
    throw new Error("Unable to connect to Database");
  } finally {
    await client.close();
  }
}

module.exports = main;
