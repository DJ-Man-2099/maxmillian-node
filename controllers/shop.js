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

/* exports.getProducts = (req, res, next) => {
  //using Local file 
  //res.sendFile(path.join(rootDir, "views", "shop.html"));
  //for dynamic template
  Product.fetchAll((products) => {
    res.render("shop/products-list", {
      prods: products,
      pageTitle: "Products List",
      path: "/products",
    });
  });
}; */

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

/* exports.getProduct = (req, res, next) => {
  //using local File
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
}; */

exports.getProduct = (req, res, next) => {
  //res.sendFile(path.join(rootDir, "views", "shop.html"));
  //for dynamic template
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

/* exports.getCart = (req, res, next) => {
  //using local file
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
}; */

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

/* exports.postCart = (req, res, next) => {
  //using local file
  console.log(req.body);
  cart.addProduct(req.body.productID, req.body.price, () => {
    res.redirect("/cart");
  });
}; */

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

/* exports.deleteCart = (req, res, next) => {
  //using local file
  cart.deleteProduct(req.body.productID, req.body.price, () => {
    res.redirect("/cart");
  });
}; */

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
