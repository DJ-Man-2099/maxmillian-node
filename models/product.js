const mongoDb = require("mongodb");

const { getProductsCollection } = require("../util/mongodb");

class Product {
  constructor({
    title: title,
    user: user,
    price: price,
    description: description,
    imageURL: imageURL,
    _id: _id,
  }) {
    this.title = title;
    this.user = user;
    this.price = price;
    this.description = description;
    this.imageURL = imageURL;
    if (_id) {
      this._id = new mongoDb.ObjectId(_id);
    }
  }

  save = () => {
    //as insertOne returns a promise
    let dbOps;
    if (this._id) {
      dbOps = getProductsCollection().updateOne(
        { _id: this._id },
        { $set: this }
      );
    } else {
      dbOps = getProductsCollection().insertOne(this);
    }
    return dbOps
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  static deleteByID = (ID) => {
    return getProductsCollection()
      .deleteOne({ _id: new mongoDb.ObjectId(ID) })
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  delete = () => {
    return getProductsCollection()
      .deleteOne({ _id: this._id })
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  static fetchAll = () => {
    return getProductsCollection()
      .find()
      .toArray()
      .catch((err) => {
        console.log(err);
      })
      .then((result) => {
        console.log(result);
        return result;
      });
  };

  static findByID = (ID) => {
    return getProductsCollection()
      .find({ _id: new mongoDb.ObjectId(ID) })
      .next()
      .then((result) => {
        console.log(result);
        return result;
      })
      .catch((err) => {
        console.log(err);
      });
  };
}

module.exports = Product;
