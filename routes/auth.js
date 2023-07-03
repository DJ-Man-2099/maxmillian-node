const express = require("express");
const { check, body } = require("express-validator");
const bcrypt = require("bcryptjs");

const authController = require("../controllers/auth");
const user = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.get("/reset-password", authController.getResetPassword);

router.get("/reset-password/:token", authController.getNewPassword);

router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("Please Enter a valid Email")
      .toLowerCase()
      .normalizeEmail()
      .custom(async (email) => {
        const userDoc = await user.findOne({ email: email });
        if (!userDoc) {
          return Promise.reject("Email is Incorrect or Not Found");
        }
      }),
    body("password")
      .custom(async (password, { req }) => {
        /* if (email === "test@test.com") {
      throw new Error("This Email address is Forbidden");
    } */
        const userDoc = await user.findOne({ email: req.body.email });
        return bcrypt.compare(password, userDoc.password).then((sameUser) => {
          if (!sameUser) {
            return Promise.reject("Password is Incorrect");
          }
        });
      })
      .trim(),
  ],
  authController.postLogin
);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please Enter a valid Email")
      .custom(async (email) => {
        /* if (email === "test@test.com") {
          throw new Error("This Email address is Forbidden");
        } */
        const userDoc = await user.findOne({ email: email });
        if (userDoc) {
          return Promise.reject("Email already exists");
        }
      })
      .toLowerCase()
      .normalizeEmail(),
    body(
      "password",
      "Password should be at least 6 characters and contains numbers and letters only"
    )
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .custom((repeatedPassword, { req }) => {
        if (repeatedPassword !== req.body.password) {
          throw new Error("Passwords don't match");
        }
        return true;
      })
      .trim(),
  ],
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.post("/reset-password", authController.postResetButtonClicked);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
