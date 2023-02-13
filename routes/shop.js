const express = require("express");
const path = require("path");

const rootDir = require("../util/path");
const adminData = require("./admin");

const router = express.Router();

router.get("/", (req, res, next) => {
  console.log(adminData.products);
  //res.sendFile(path.join(rootDir, "views", "shop.html"));
  //for dynamic template
  const products = adminData.products;
  res.render("shop", { prods: products, pageTitle: "My Shop", path: "/" });
});

module.exports = router;
