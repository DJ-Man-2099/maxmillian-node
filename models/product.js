/* //using local file
const fs = require("fs");
const path = require("path");

const root = require("../util/path");
const cart = require("./cart");

const savePath = path.join(root, "data", "Products.json");

module.exports = class Product {
  constructor(ID, title, imageURL, description, price) {
    this.ID = ID;
    this.title = title;
    this.imageURL = imageURL;
    this.description = description;
    this.price = price;
  }

  save(callback) {
    Product.fetchAll((products) => {
      if (this.ID) {
        const existingProductIndex = products.findIndex(
          (product) => product.ID === this.ID
        );
        products = [...products];
        products[existingProductIndex] = this;
      } else {
        this.ID = Math.random().toString();
        products.push(this);
      }
      fs.writeFile(savePath, JSON.stringify(products), (err) => {
        console.log(err);
        if (!err) {
          callback();
        }
      });
    });
  }

  delete(callback) {
    Product.fetchAll((products) => {
      const existingProductIndex = products.findIndex(
        (product) => product.ID === this.ID
      );
      const existingProduct = products[existingProductIndex];
      products = [...products];
      products.splice(existingProductIndex, 1);
      fs.writeFile(savePath, JSON.stringify(products), (err) => {
        console.log(err);
        if (!err) {
          cart.deleteProduct(this.ID, existingProduct.price, callback());
        }
      });
    });
  }

  static fetchAll(callback = (products = []) => {}) {
    fs.readFile(savePath, (err, content) => {
      let products = [];
      if (!err) {
        products = JSON.parse(content);
      }
      callback(products);
    });
  }

  static fetchOne(ID, callback) {
    fs.readFile(savePath, (err, content) => {
      let products = [];
      if (!err) {
        products = JSON.parse(content);
        const product = products.find((value) => value.ID === ID);
        return callback(product);
      }
      callback(new Product());
    });
  }
};
 */
const mongoDb = require("mongodb");

const { getProductsCollection } = require("../util/mongodb");

class Product {
  constructor({
    title: title,
    user: user,
    price: price,
    description: description,
    imageURL: imageURL,
    id: _id,
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
