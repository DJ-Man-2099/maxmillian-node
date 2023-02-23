exports.getAddProduct = (req, res, next) => {
  res.render("admin/upsert-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    product: null,
  });
};

const Product = require("../models/product");

exports.getEditProduct = (req, res, next) => {
  //using Mongoose
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  Product.findById(req.params.ID).then((product) => {
    res.render("admin/upsert-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      product: product,
    });
  });
};

exports.getAdminProducts = (req, res, next) => {
  //using Mongoose
  Product.find()
    //fills ref with data from other relations
    //second arg selects the required field
    .populate("user", "name email -_id")
    .then((products) => {
      res.render("admin/admin-products-list", {
        prods: products,
        pageTitle: "Admin Products List",
        path: "/admin/products",
      });
    });
};

exports.postAddProduct = (req, res, next) => {
  //Using Mongoose
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
    user: user,
  });
  product.save().then(() => {
    res.redirect("/admin/products");
  });
};

exports.postEditProduct = (req, res, next) => {
  //using Mongoose
  const ID = req.body.ID;
  const title = req.body.title;
  const imageURL = req.body.imageURL;
  const description = req.body.description;
  const price = req.body.price;
  Product.findById(ID)
    .then((product) => {
      console.log("Saving!!!!");
      product.title = title;
      product.imageURL = imageURL;
      product.description = description;
      product.price = price;
      return product.save();
    })
    .then(() => {
      console.log("Saved!!!!");
      res.redirect("/admin/products");
    });
};

exports.postDeleteProduct = (req, res, next) => {
  //using Mongoose
  const ID = req.body.ID;
  Product.findByIdAndRemove(ID)
    .then(async (product) => {
      console.log("Deleting!!!!");
      await product.delete();
      return product;
    })
    .then((product) => {
      const user = req.user;
      return user.removeFromCart(product);
    })
    .then((result) => {
      console.log("Deleted!!!!");
      res.redirect("/admin/products");
    });
};
