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
