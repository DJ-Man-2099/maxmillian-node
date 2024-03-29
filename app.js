const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const { mongoConnect, session } = require("./util/mongodb");
const csurf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const fs = require("fs");
const { log } = require("console");
const https = require("https");

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();
const csrfProtection = csurf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const accessFileStream = fs.createWriteStream(
	path.join(__dirname, "access.log"),
	{ flags: "a" }
);
const privateKey = fs.readFileSync("max-node.key");
const certificate = fs.readFileSync("max-node.cert");

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "public/images");
	},
	filename: (req, file, cb) => {
		log(new Date().toISOString());
		log(new Date().toUTCString());
		log(new Date().toDateString());
		log(new Date().toString());
		const newName = `${Date.now()} - ${file.originalname}`;
		cb(null, newName);
	},
});
const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === "image/png" ||
		file.mimetype === "image/jpg" ||
		file.mimetype === "image/jpeg"
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

app.use(helmet());
app.use(compression());
app.use(
	morgan("combined", {
		stream: accessFileStream,
	})
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
	multer({
		storage: fileStorage,
		fileFilter: fileFilter,
	}).single("image")
); //for file upload
app.use(express.static(path.join(__dirname, "public")));
app.use("/public", express.static(path.join(__dirname, "public"))); //for images serving in products

app.use(session);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
	(res.locals.isAuthenticated = req.session.isLoggedIn),
		(res.locals.csrfToken = req.csrfToken()),
		next();
});

app.use((req, res, next) => {
	if (!req.session.user) {
		return next();
	}
	User.findById(req.session.user._id)
		.then((user) => {
			req.user = user;
			next();
		})
		.catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/500", errorController.get500);
app.use(errorController.get404);
//Global Erro Handler, Defined at the very end
app.use((err, req, res, next) => {
	log(err);
	res.redirect("/500");
});

mongoConnect((result) => {
	/* https
		.createServer(
			{
				cert: certificate,
				key: privateKey,
			},
			app
		)
		.listen(process.env.PORT || 3000); */
	app.listen(process.env.PORT || 3000);
});
