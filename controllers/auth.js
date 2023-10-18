const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator");

const User = require("../models/user");

const transporter = nodemailer.createTransport(
	sendGridTransport({
		auth: {
			api_key: process.env.SEND_GRID,
		},
	})
);

exports.getLogin = (req, res, next) => {
	let message = req.flash("error");
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render("auth/login", {
		path: "/login",
		pageTitle: "Login",
		errorMessage: message,
		oldInput: {
			email: "",
			password: "",
		},
		validationErrors: [],
	});
};

exports.getSignup = (req, res, next) => {
	let message = req.flash("error");
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render("auth/signup", {
		path: "/signup",
		pageTitle: "Signup",
		errorMessage: message,
		oldInput: {
			email: "",
			password: "",
			confirmPassword: "",
		},
		validationErrors: [],
	});
};

exports.getResetPassword = (req, res, next) => {
	let message = req.flash("error");
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render("auth/reset-password", {
		path: "/reset-password",
		pageTitle: "Reset Password",
		errorMessage: message,
	});
};

exports.getNewPassword = (req, res, next) => {
	const token = req.params.token;
	User.findOne({
		resetToken: token,
		resetTokenExpiryDate: {
			$gt: Date.now(),
		},
	})
		.then((user) => {
			if (!user) {
				return res.redirect("/login");
			}
			let message = req.flash("error");
			if (message.length > 0) {
				message = message[0];
			} else {
				message = null;
			}
			res.render("auth/new-password", {
				path: "/new-password",
				pageTitle: "New Password",
				errorMessage: message,
				userId: user._id.toString(),
				token: token,
			});
		})
		.catch((err) => {
			next(err);
		});
};

exports.postLogin = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(222).render("auth/login", {
			path: "/login",
			pageTitle: "Login",
			errorMessage: errors.array()[0].msg,
			oldInput: {
				email: email,
				password: password,
			},
			validationErrors: errors.array(),
		});
	}
	req.session.isLoggedIn = true;
	return User.findOne({ email: req.body.email }).then((userDoc) => {
		console.log(userDoc);
		req.session.user = userDoc;
		return req.session.save((err) => {
			console.log(err);
			return res.redirect("/");
		});
	});
};

const sourceEmail = "davidmesak@hotmail.com";

exports.postSignup = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	const confirmPassword = req.body.confirmPassword;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(222).render("auth/signup", {
			path: "/signup",
			pageTitle: "Signup",
			errorMessage: errors.array()[0].msg,
			oldInput: {
				email: email,
				password: password,
				confirmPassword: confirmPassword,
			},
			validationErrors: errors.array(),
		});
	}
	bcrypt
		.hash(password, 12)
		.then((hashedPass) => {
			const user = new User({
				email: email,
				password: hashedPass,
				cart: { items: [] },
			});
			return user.save();
		})
		.then((result) => {
			res.redirect("/login");
			return transporter.sendMail({
				to: email,
				from: sourceEmail,
				subject: "Signup Suceeded",
				html: "<h1>You Successfully Signed Up!!!!!</h1>",
			});
		});
};

exports.postLogout = (req, res, next) => {
	req.session.destroy((err) => {
		console.log(err);
		res.redirect("/");
	});
};

exports.postResetButtonClicked = (req, res, next) => {
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			return res.redirect("/reset-password");
		}
		const token = buffer.toString("hex");
		const email = req.body.email;
		User.findOne({ email: req.body.email })
			.then((user) => {
				if (!user) {
					req.flash("error", "Invalid Email");
					return res.redirect("/reset-password");
				}
				user.resetToken = token;
				user.resetTokenExpiryDate = Date.now() + 3600 * 1000;
				return user.save().then((result) => {
					res.redirect("/");
					return transporter.sendMail({
						to: email,
						from: sourceEmail,
						subject: "Password Reset",
						html: `
            <p>You requested a password reset</p>
            <p>click this <a href='http://localhost:3000/reset-password/${token}'>link</a> to set a new password</p>
            `,
					});
				});
			})
			.catch((err) => {
				next(err);
			});
	});
};

exports.postNewPassword = (req, res, next) => {
	const newPassword = req.body.password;
	const userId = req.body.userId;
	const token = req.body.token;
	let foundUser;

	User.findOne({
		resetToken: token,
		resetTokenExpiryDate: { $gt: Date.now() },
		_id: userId,
	})
		.then((user) => {
			foundUser = user;
			return bcrypt.hash(newPassword, 12);
		})
		.then((hashedPass) => {
			foundUser.password = hashedPass;
			foundUser.resetToken = undefined;
			foundUser.resetTokenExpiryDate = undefined;
			return foundUser.save();
		})
		.then((result) => {
			res.redirect("/login");
		})
		.catch((err) => next(err));
};
