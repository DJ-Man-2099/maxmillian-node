exports.getAddProduct = (req, res, next) => {
  //res.sendFile(path.join(rootDir, "views", "add-product.html"));
  res.render("admin/upsert-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    product: null,
  });
};

const Product = require("../models/product");

/* exports.getEditProduct = (req, res, next) => {
  //using local file
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
}; */

exports.getEditProduct = (req, res, next) => {
  //using MongoDB
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  Product.findByID(req.params.ID).then((product) => {
    res.render("admin/upsert-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      product: product,
    });
  });
};

/* exports.getAdminProducts = (req, res, next) => {
  //using local file
  //res.sendFile(path.join(rootDir, "views", "shop.html"));
  //for dynamic template
  Product.fetchAll((products) => {
    res.render("admin/admin-products-list", {
      prods: products,
      pageTitle: "Admin Products List",
      path: "/admin/products",
    });
  });
}; */

exports.getAdminProducts = (req, res, next) => {
  //using Mongodb
  Product.fetchAll().then((products) => {
    res.render("admin/admin-products-list", {
      prods: products,
      pageTitle: "Admin Products List",
      path: "/admin/products",
    });
  });
};

/*exports.postAddProduct = (req, res, next) => {
  //Using Local Files
   const title = req.body.title;
  const imageURL = req.body.imageURL;
  const description = req.body.description;
  const price = req.body.price;
  const product = new Product(null, title, imageURL, description, price);
  product.save(() => {
    res.redirect("/admin/products");
  }); 
};*/

exports.postAddProduct = (req, res, next) => {
  //Using MongoDB
  const title = req.body.title;
  const imageURL = req.body.imageURL;
  const description = req.body.description;
  const price = req.body.price;
  const user = req.user;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageURL: imageURL,
    user: user._id,
  });
  product.save().then(() => {
    res.redirect("/admin/products");
  });
};

/* exports.postEditProduct = (req, res, next) => {
  //using local File
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
}; */

exports.postEditProduct = (req, res, next) => {
  //using MongoDB
  const ID = req.body.ID;
  const title = req.body.title;
  const imageURL = req.body.imageURL;
  const description = req.body.description;
  const price = req.body.price;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageURL: imageURL,
    id: ID,
  });
  console.log("Saving!!!!");
  product.save().then(() => {
    console.log("Saved!!!!");
    res.redirect("/admin/products");
  });
};

/* exports.postDeleteProduct = (req, res, next) => {
  //using Local file
  const ID = req.body.ID;
  const product = new Product(ID);
  console.log("Saving!!!!");
  product.delete(() => {
    console.log("Saved!!!!");
    res.redirect("/admin/products");
  });
}; */

exports.postDeleteProduct = (req, res, next) => {
  //using MongoDB
  const ID = req.body.ID;
  console.log(ID);
  const product = new Product({ id: ID });
  console.log(product);
  console.log("Deleting!!!!");
  product.delete().then(() => {
    console.log("Deleted!!!!");
    res.redirect("/admin/products");
  });
};
