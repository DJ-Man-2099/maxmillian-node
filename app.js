const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const pageNotFound = require("./controllers/404");
const { mongoConnect } = require("./util/mongodb");

const User = require("./models/user");

const app = express();

//compile with ejs
app.set("view engine", "ejs");

//look for views in views folder
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false })); //parses body from requests
app.use(express.static(path.join(__dirname, "public"))); //allows access to public folder for users

app.use((req, res, next) => {
  User.findById("63f6691ac630b6c6313f1aae")
    .then((user) => {
      req.user = user;
      console.log(req.user);
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(pageNotFound);

mongoConnect(() => {
  User.findOne().then((user) => {
    if (!user) {
      const user = new User({
        name: "David",
        email: "dj@hotmail.com",
        cart: {
          items: [],
          totalPrice: 0,
        },
      });
      user.save();
    }
  });
  app.listen(5000);
});
