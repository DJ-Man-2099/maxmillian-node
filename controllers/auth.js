const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  console.log(req.session.isLoggedIn);
  if (req.session.isLoggedIn) {
    res.redirect("/");
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuth: req.session.isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  User.findById("63f6691ac630b6c6313f1aae")
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      //check that session data is saved first
      req.session.save((err) => {
        res.redirect("/");
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log("destroying");
    console.log(err);
    res.redirect("/");
  });
};
