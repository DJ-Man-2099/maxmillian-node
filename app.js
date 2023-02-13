/* var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
 */
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
//const expresshbs = require("express-handlebars");
const pageNotFound = require("./controllers/404");

const app = express();

/* //compile with pug
app.set("view engine", "pug");*/

/* //compile with express-handlebars
app.engine("hbs", expresshbs.engine());
app.set("view engine", "hbs"); */

//compile with ejs
app.set("view engine", "ejs");

//look for views in views folder
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false })); //parses body from requests
app.use(express.static(path.join(__dirname, "public"))); //allows access to public folder for users

//order doesn't matter bec we don't use "router.use()"
app.use("/admin", adminRoutes);
app.use(shopRoutes);
//this also works
//app.use(shopRoutes);
//app.use('/admin', adminRoutes);

app.use(pageNotFound);

app.listen(3000);
