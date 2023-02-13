const fs = require("fs");
const path = require("path");

const root = require("../util/path");

const savePath = path.join(root, "data", "Products.json");

module.exports = class Product {
  constructor(title) {
    this.title = title;
  }

  save() {
    Product.fetchAll((products) => {
      products.push(this);
      fs.writeFile(savePath, JSON.stringify(products), (err) => {
        console.log(err);
      });
    });
  }

  static fetchAll(callback) {
    fs.readFile(savePath, (err, content) => {
      let products = [];
      if (!err) {
        products = JSON.parse(content);
      }
      callback(products);
    });
  }
};
