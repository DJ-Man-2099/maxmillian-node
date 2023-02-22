const mongoose = require("mongoose");

const SERVER_URL = "mongodb://127.0.0.1:27017/";
const DATABASE_NAME = "maxmillian-node";

const mongoConnect = (callback) => {
  mongoose
    .connect(SERVER_URL + DATABASE_NAME)
    .then((result) => {
      console.log("connected");
      callback();
    })
    .catch((err) => {
      console.log("err", err);
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
