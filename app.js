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
  User.findByID("63f57f9b08ffde86485ee5c2")
    .then((user) => {
      req.user = new User(user);
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
  app.listen(3000);
});
