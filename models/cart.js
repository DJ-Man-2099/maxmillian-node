/* //using local file
const fs = require("fs");
const path = require("path");

const root = require("../util/path");

const savePath = path.join(root, "data", "Cart.json");

module.exports = class Cart {
  constructor() {
    this.products = [];
    this.totalPrice = 0.0;
  }

  static addProduct = (ID, price, callback) => {
    fs.readFile(savePath, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      const existingProductIndex = cart.products.findIndex(
        (prod) => prod.ID === ID
      );
      let updatedProduct;
      if (existingProductIndex >= 0) {
        updatedProduct = { ...cart.products[existingProductIndex] };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { ID: ID, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice += +price;
      fs.writeFile(savePath, JSON.stringify(cart), (err) => {
        console.log(err);
        callback();
      });
    });
  };

  static deleteProduct = (ID, price, callback) => {
    fs.readFile(savePath, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      const existingProductIndex = cart.products.findIndex(
        (prod) => prod.ID === ID
      );
      console.log(existingProductIndex, cart.products, ID);
      if (existingProductIndex >= 0) {
        const product = cart.products[existingProductIndex];
        cart.products = [...cart.products];
        cart.products.splice(existingProductIndex, 1);
        cart.totalPrice -= +price * product.qty;
        if (cart.products.length === 0) {
          cart.totalPrice = 0;
        }
        fs.writeFile(savePath, JSON.stringify(cart), (err) => {
          console.log(err);
          if (!err) {
            callback();
          }
        });
      }
    });
  };

  static getCart = (callback = (cart = new Cart()) => {}) => {
    fs.readFile(savePath, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
        callback(cart);
      }
    });
  };
};
 */
