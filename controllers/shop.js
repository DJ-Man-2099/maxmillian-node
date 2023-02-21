exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
  });
};

exports.getOrders = (req, res, next) => {
  res.render("shop/orders", {
    pageTitle: "Orders",
    path: "/orders",
  });
};

const Product = require("../models/product");

exports.getIndex = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("shop/index", {
      prods: products,
      pageTitle: "My Shop",
      path: "/",
    });
  });
};

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

exports.getProduct = (req, res, next) => {
  //res.sendFile(path.join(rootDir, "views", "shop.html"));
  //for dynamic template
  const prodID = req.params.ID;
  Product.fetchOne(prodID, (product) => {
    res.render("shop/product-detail", {
      prod: product,
      pageTitle: "Product Detail",
      path: `/products`,
    });
  });
};

const cart = require("../models/cart");

exports.getCart = (req, res, next) => {
  cart.getCart((current) => {
    Product.fetchAll((products) => {
      const cartProducts = [];
      current.products.forEach((element) => {
        const found = products.find((product) => product.ID === element.ID);
        if (found) {
          cartProducts.push({ product: found, qty: element.qty });
        }
      });
      console.log(cartProducts);
      res.render("shop/cart", {
        pageTitle: "My Cart",
        path: "/cart",
        products: cartProducts,
        total: current.totalPrice,
      });
    });
  });
};

exports.postCart = (req, res, next) => {
  console.log(req.body);
  cart.addProduct(req.body.productID, req.body.price, () => {
    res.redirect("/cart");
  });
};

exports.deleteCart = (req, res, next) => {
  cart.deleteProduct(req.body.productID, req.body.price, () => {
    res.redirect("/cart");
  });
};
