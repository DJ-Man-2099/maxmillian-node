exports.getIndex = (req, res, next) => {
  res.render("shop/index", {
    pageTitle: "My Shop",
    path: "/",
  });
};

exports.getCart = (req, res, next) => {
  res.render("shop/cart", {
    pageTitle: "My Cart",
    path: "/cart",
  });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
  });
};

const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
  //res.sendFile(path.join(rootDir, "views", "shop.html"));
  //for dynamic template
  Product.fetchAll((products) => {
    res.render("shop/products-list", {
      prods: products,
      pageTitle: "Products List",
      path: "/products",
    });
  });
};
