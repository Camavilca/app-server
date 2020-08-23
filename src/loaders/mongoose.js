import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import config from "../config";

export default async ({ mongoDriver = false } = {}) => {
  let connection = null;
  const DB_NAME = "hcp";
  if (mongoDriver) {
    return new Promise((resolve, reject) => {
      const client = new MongoClient(config.mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      client.connect((err) => {
        if (err) return reject(err);
        let db = client.db(DB_NAME);
        resolve({ db, client });
      });
    });
  } else {
    connection = await mongoose
      .connect(config.mongoUri, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      })
      .then(
        () => console.log("Connected to DB"),
        (err) => console.log("DB error connection: ", err)
      );
    // console.log("Connected to DB");
  }
  return connection;
};
