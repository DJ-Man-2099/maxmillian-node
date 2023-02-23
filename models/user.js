const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const {
  getProductsCollection,
  getUsersCollection,
  getOrdersCollection,
} = require("../util/mongodb");
const Product = require("./product");

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    totalPrice: {
      type: Number,
      required: true,
    },
    items: [
      {
        productID: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        qty: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = () => {};

module.exports = mongoose.model("User", userSchema);
