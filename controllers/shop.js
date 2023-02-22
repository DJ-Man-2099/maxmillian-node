exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
  });
};

exports.getOrders = (req, res, next) => {
  const user = req.user;
  user.getOrders().then((orders) => {
    console.log("orders", orders);
    res.render("shop/orders", {
      pageTitle: "Orders",
      path: "/orders",
      orders: orders,
    });
  });
};

const Product = require("../models/product");

/* exports.getIndex = (req, res, next) => {
  //using Local file
  Product.fetchAll((products) => {
    res.render("shop/index", {
      prods: products,
      pageTitle: "My Shop",
      path: "/",
    });
  });
}; */

exports.getIndex = (req, res, next) => {
  //using MongoDb
  Product.fetchAll().then((products) => {
    res.render("shop/index", {
      prods: products,
      pageTitle: "My Shop",
      path: "/",
    });
  });
};

exports.getProducts = (req, res, next) => {
  //using Mongodb
  Product.fetchAll().then((products) => {
    res.render("shop/products-list", {
      prods: products,
      pageTitle: "Products List",
      path: "/products",
    });
  });
};

exports.getProduct = (req, res, next) => {
  const prodID = req.params.ID;
  Product.findByID(prodID).then((product) => {
    res.render("shop/product-detail", {
      prod: product,
      pageTitle: "Product Detail",
      path: `/products`,
    });
  });
};

const cart = require("../models/cart");

exports.getCart = (req, res, next) => {
  //using MongoDb
  /* //Method 1
  const userCart = req.user.cart;
  Product.fetchAll().then((products) => {
    const cartProducts = [];
    userCart.items.forEach((cartProduct) => {
      console.log(cartProduct);
      const product = products.find((p) => p._id.equals(cartProduct.productID));
      cartProducts.push({ ...product, qty: cartProduct.qty });
    });
    console.log(cartProducts);
    res.render("shop/cart", {
      pageTitle: "My Cart",
      path: "/cart",
      products: cartProducts,
      total: userCart.totalPrice,
    });
  }); */
  //Method 2
  const user = req.user;
  user.getCart().then((cart) => {
    res.render("shop/cart", {
      pageTitle: "My Cart",
      path: "/cart",
      products: cart.items,
      total: cart.totalPrice,
    });
  });
};

exports.postCart = (req, res, next) => {
  //using MongoDb
  const user = req.user;
  const prodID = req.body.productID;
  Product.findByID(prodID)
    .then((product) => {
      console.log("body", req.body);
      return user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
      console.log(result);
    });
};

exports.deleteCart = (req, res, next) => {
  //using MongoDb
  const user = req.user;
  const prodID = req.body.productID;
  Product.findByID(prodID)
    .then((product) => {
      return user.removeFromCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
      console.log(result);
    });
};

exports.postOrder = (req, res, next) => {
  const user = req.user;
  user.addOrder().then((result) => {
    console.log(result);
    res.redirect("/orders");
  });
};
