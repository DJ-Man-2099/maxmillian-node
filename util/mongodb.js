const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);

const USER_NAME = process.env.USER_NAME;
const PASSWORD = process.env.PASSWORD;
const DATABASE_NAME = process.env.MONGO_DB;

const mongoConnect = (callback) => {
	mongoose.set("strictQuery", false);
	mongoose
		.connect(
			`mongodb+srv://${USER_NAME}:${PASSWORD}@cluster0.cvms6cj.mongodb.net/${DATABASE_NAME}?retryWrites=true`,
			{
				authMechanism: "SCRAM-SHA-1",
			}
		)
		.then((result) => {
			console.log("connected");
			callback();
		})
		.catch((err) => {
			console.log("err", err);
		});
};

const store = new MongoDbStore({
	uri: `mongodb+srv://${USER_NAME}:${PASSWORD}@cluster0.cvms6cj.mongodb.net/${DATABASE_NAME}?retryWrites=true&w=majority`,
	collection: "sessions",
	connectionOptions: {
		authMechanism: "SCRAM-SHA-1",
	},
});
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
exports.session = session({
	secret: "Dj-Man Rules 2099 and every other period",
	resave: false,
	saveUninitialized: false,
	store: store,
});
