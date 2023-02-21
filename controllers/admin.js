exports.getAddProduct = (req, res, next) => {
  //res.sendFile(path.join(rootDir, "views", "add-product.html"));
  res.render("admin/upsert-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    product: null,
  });
};

const Product = require("../models/product");

exports.getEditProduct = (req, res, next) => {
  //res.sendFile(path.join(rootDir, "views", "add-product.html"));
  //query params used for tracking user/filters
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  Product.fetchOne(req.params.ID, (product) => {
    console.log(product, req.params.ID);
    res.render("admin/upsert-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      product: product,
    });
  });
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

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageURL = req.body.imageURL;
  const description = req.body.description;
  const price = req.body.price;
  const product = new Product(null, title, imageURL, description, price);
  product.save(() => {
    res.redirect("/admin/products");
  });
};

exports.postEditProduct = (req, res, next) => {
  const ID = req.body.ID;
  const title = req.body.title;
  const imageURL = req.body.imageURL;
  const description = req.body.description;
  const price = req.body.price;
  const product = new Product(ID, title, imageURL, description, price);
  console.log("Saving!!!!");
  product.save(() => {
    console.log("Saved!!!!");
    res.redirect("/admin/products");
  });
};

exports.postDeleteProduct = (req, res, next) => {
  const ID = req.body.ID;
  const product = new Product(ID);
  console.log("Saving!!!!");
  product.delete(() => {
    console.log("Saved!!!!");
    res.redirect("/admin/products");
  });
};
