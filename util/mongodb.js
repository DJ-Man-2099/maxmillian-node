const mongodb = require("mongodb");

const client = mongodb.MongoClient;

const SERVER_URL = "mongodb://127.0.0.1:27017/";
const DATABASE_NAME = "maxmillian-node";

let _db;

const mongoConnect = (callback) => {
  client
    .connect(SERVER_URL + DATABASE_NAME)
    .then((result) => {
      console.log("connected");
      _db = result.db();
      callback();
    })
    .catch((err) => {
      console.log("err", err);
      throw err;
    });
};

const getDB = () => {
  if (_db) {
    return _db;
  }
  throw "No database found";
};

const getProductsCollection = () => {
  const db = getDB();
  return db.collection("products");
};

const getUsersCollection = () => {
  const db = getDB();
  return db.collection("users");
};

const getOrdersCollection = () => {
  const db = getDB();
  return db.collection("orders");
};

exports.mongoConnect = mongoConnect;
exports.getDB = getDB;
exports.getProductsCollection = getProductsCollection;
exports.getUsersCollection = getUsersCollection;
exports.getOrdersCollection = getOrdersCollection;
