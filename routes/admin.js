const path = require("path");
const express = require("express");
const { check, body } = require("express-validator");
const bcrypt = require("bcryptjs");

const adminController = require("../controllers/admin");
const isAuth = require("../util/is-auth");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
  "/add-product",
  isAuth,
  [body("title").isAlphanumeric().trim(), body("price").isFloat()],
  adminController.postAddProduct
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  isAuth,
  [body("title").isAlphanumeric().trim(), body("price").isFloat()],
  adminController.postEditProduct
);

router.delete("/product/:id", isAuth, adminController.deleteProduct);

module.exports = router;
