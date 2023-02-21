const express = require("express");

const shopController = require("../controllers/shop");

const router = express.Router();

router.get("/products", shopController.getProducts);
//put the dynamic segment route at the bottom
router.get("/products/:ID", shopController.getProduct);
router.get("/", shopController.getIndex);
router.get("/cart", shopController.getCart);
router.get("/checkout", shopController.getCheckout);
router.get("/orders", shopController.getOrders);

router.post("/cart", shopController.postCart);
router.post("/cart-delete-item", shopController.deleteCart);

module.exports = router;
