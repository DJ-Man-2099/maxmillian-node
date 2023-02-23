const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const {
  getProductsCollection,
  getUsersCollection,
  getOrdersCollection,
} = require("../util/mongodb");
const Order = require("./order");

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

userSchema.methods.getCart = function () {
  return this.cart.populate("items.productID", "title price").then((result) => {
    return result;
  });
};

userSchema.methods.addOrder = function () {
  const order = new Order({
    items: this.cart.items,
    totalPrice: this.cart.totalPrice,
    userID: this._id,
  });
  return order.save().then((result) => {
    this.cart = {
      totalPrice: 0,
      items: [],
    };
    return this.save();
  });
};

userSchema.methods.getOrders = function () {
  return Order.find({ userID: this._id }).populate(
    "items.productID",
    "title -_id"
  );
};

userSchema.methods.removeFromCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cartProduct) => {
    return product._id.equals(cartProduct.productID);
  });
  if (cartProductIndex >= 0) {
    const updatedItems = [...this.cart.items];
    const removedProduct = updatedItems.splice(cartProductIndex, 1)[0];
    const totalPrice =
      +this.cart.totalPrice - +product.price * removedProduct.qty;
    const updatedCart = {
      totalPrice: totalPrice,
      items: updatedItems,
    };
    this.cart = updatedCart;
    return this.save();
  } else {
    return new Promise(
      (resolve) => {
        resolve();
      },
      (reject) => {
        reject();
      }
    );
  }
};

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cartProduct) => {
    return product._id.equals(cartProduct.productID);
  });
  const totalPrice = +this.cart.totalPrice + +product.price;
  let updatedItems;
  if (cartProductIndex >= 0) {
    updatedItems = [...this.cart.items];
    updatedItems[cartProductIndex].qty++;
  } else {
    updatedItems = [
      ...this.cart.items,
      {
        productID: product._id,
        qty: 1,
      },
    ];
  }
  const updatedCart = {
    totalPrice: totalPrice,
    items: updatedItems,
  };
  this.cart = updatedCart;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
