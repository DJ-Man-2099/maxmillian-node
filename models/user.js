//Using MongoDb
const mongoDb = require("mongodb");

const {
  getProductsCollection,
  getUsersCollection,
  getOrdersCollection,
} = require("../util/mongodb");
const Product = require("./product");

class User {
  constructor({
    name: username,
    email: email,
    cart: cart = { items: [], totalPrice: 0 },
    _id: _id,
  }) {
    this.name = username;
    this.email = email;
    this.cart = cart;
    if (_id) {
      this._id = new mongoDb.ObjectId(_id);
    }
  }

  save() {
    return getUsersCollection()
      .insertOne(this)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getCart() {
    const productIDs = this.cart.items.map((i) => i.productID);
    return getProductsCollection()
      .find({ _id: { $in: productIDs } })
      .toArray()
      .then((products) => {
        const updatedProducts = products.map((product) => {
          return {
            ...product,
            qty: this.cart.items.find((p) => p.productID.equals(product._id))
              .qty,
          };
        });
        return { items: updatedProducts, totalPrice: this.cart.totalPrice };
      });
  }

  addToCart(product = new Product()) {
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
    return getUsersCollection()
      .updateOne({ _id: this._id }, { $set: { cart: updatedCart } })
      .then((result) => {
        console.log("isUpdated:", result);
        return result;
      });
  }

  removeFromCart(product = new Product()) {
    const cartProductIndex = this.cart.items.findIndex((cartProduct) => {
      return product._id.equals(cartProduct.productID);
    });
    let updatedItems;
    updatedItems = [...this.cart.items];
    const deletedItem = updatedItems.splice(cartProductIndex, 1);
    console.log(deletedItem);
    const totalPrice =
      updatedItems.length > 0
        ? +this.cart.totalPrice - +product.price * deletedItem[0].qty
        : 0;
    const updatedCart = {
      totalPrice: totalPrice,
      items: updatedItems,
    };
    return getUsersCollection()
      .updateOne({ _id: this._id }, { $set: { cart: updatedCart } })
      .then((result) => {
        console.log("isUpdated:", result);
        return result;
      });
  }

  addOrder() {
    /* //Method 1
    return getOrdersCollection()
      .insertOne({ ...this.cart, user: this._id })
      .then((result) => {
        this.cart = {
          items: [],
          totalPrice: 0,
        };
        return getUsersCollection().updateOne(
          { _id: this._id },
          { $set: { cart: this.cart } }
        );
      }); */
    //Method 2
    return this.getCart()
      .then((cart) => {
        const order = {
          ...cart,
          user: this._id,
        };
        return getOrdersCollection().insertOne(order);
      })
      .then((result) => {
        this.cart = {
          items: [],
          totalPrice: 0,
        };
        return getUsersCollection().updateOne(
          { _id: this._id },
          { $set: { cart: this.cart } }
        );
      });
  }

  /*   //Method 1
  async getOrders() {
    const orders = await getOrdersCollection()
      .find({ user: this._id })
      .toArray();

    const products = await getProductsCollection().find().toArray();

    const updatedOrders = orders.map((order) => {
      order.items = order.items.map((orderProduct) => {
        const product = products.find((p) =>
          p._id.equals(orderProduct.productID)
        );
        return { ...orderProduct, ...product };
      });
      return order;
    });

    return updatedOrders;
  } */

  //Method 2
  getOrders() {
    return getOrdersCollection().find({ user: this._id }).toArray();
  }

  static findByID(ID) {
    return getUsersCollection()
      .findOne({ _id: new mongoDb.ObjectId(ID) })
      .then((result) => {
        //console.log(result);
        return result;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = User;
