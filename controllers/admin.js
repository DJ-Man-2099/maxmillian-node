const path = require("path");

const rootDir = require("../util/path");

exports.getAddProduct = (req, res, next) => {
  //res.sendFile(path.join(rootDir, "views", "add-product.html"));
  res.render("admin/add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
  });
};

const Product = require("../models/product");

exports.postAddProduct = (req, res, next) => {
  const product = new Product(req.body.title);
  product.save();
  res.redirect("/");
};

exports.getAdminProducts = (req, res, next) => {
  //res.sendFile(path.join(rootDir, "views", "shop.html"));
  //for dynamic template
  Product.fetchAll((products) => {
    res.render("admin/admin-products-list", {
      prods: products,
      pageTitle: "Admin Products List",
      path: "/admin/products",
    });
  });
};
