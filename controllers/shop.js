exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
    isAuth: req.session.isLoggedIn,
  });
};

exports.getOrders = (req, res, next) => {
  const user = req.user;
  user.getOrders().then((orders) => {
    res.render("shop/orders", {
      pageTitle: "Orders",
      path: "/orders",
      orders: orders,
      isAuth: req.session.isLoggedIn,
    });
  });
};

const Product = require("../models/product");

exports.getIndex = (req, res, next) => {
  //using Mongoose
  Product.find().then((products) => {
    res.render("shop/index", {
      prods: products,
      pageTitle: "My Shop",
      path: "/",
      isAuth: req.session.isLoggedIn,
    });
  });
};

exports.getProducts = (req, res, next) => {
  //using Mongoose
  Product.find().then((products) => {
    res.render("shop/products-list", {
      prods: products,
      pageTitle: "Products List",
      path: "/products",
      isAuth: req.session.isLoggedIn,
    });
  });
};

exports.getProduct = (req, res, next) => {
  const prodID = req.params.ID;
  Product.findById(prodID).then((product) => {
    res.render("shop/product-detail", {
      prod: product,
      pageTitle: "Product Detail",
      path: `/products`,
      isAuth: req.session.isLoggedIn,
    });
  });
};

exports.getCart = (req, res, next) => {
  //using Mongoose
  const user = req.user;
  user.getCart().then((cart) => {
    res.render("shop/cart", {
      pageTitle: "My Cart",
      path: "/cart",
      products: cart.items,
      total: cart.totalPrice,
      isAuth: req.session.isLoggedIn,
    });
  });
};

exports.postCart = (req, res, next) => {
  //using Mongoose
  const user = req.user;
  const prodID = req.body.productID;
  Product.findById(prodID)
    .then((product) => {
      return user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    });
};

exports.deleteCart = (req, res, next) => {
  //using Mongoose
  const user = req.user;
  const prodID = req.body.productID;
  Product.findById(prodID)
    .then((product) => {
      return user.removeFromCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    });
};

exports.postOrder = (req, res, next) => {
  const user = req.user;
  user.addOrder().then((result) => {
    res.redirect("/orders");
  });
};
