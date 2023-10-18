const { validationResult } = require("express-validator");
const Product = require("../models/product");
const fileHelper = require("../util/file");

const PRODUCTS_PER_PAGE = 1;

exports.getAddProduct = (req, res, next) => {
	let message = req.flash("error");
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render("admin/edit-product", {
		pageTitle: "Add Product",
		path: "/admin/add-product",
		editing: false,
		errorMessage: message,
	});
};

exports.postAddProduct = (req, res, next) => {
	const title = req.body.title;
	const image = req.file;
	const price = req.body.price;
	const description = req.body.description;

	const errors = validationResult(req);

	console.log(errors);
	if (!image) {
		return res.status(422).render("admin/edit-product", {
			pageTitle: "Add Product",
			path: "/admin/add-product",
			editing: false,
			product: {
				title: title,
				price: price,
				description: description,
				userId: req.user,
			},
			errorMessage: "the attached file is not an image",
			validationErrors: [],
		});
	}
	if (!errors.isEmpty()) {
		return res.status(422).render("admin/edit-product", {
			pageTitle: "Add Product",
			path: "/admin/add-product",
			editing: false,
			product: {
				title: title,
				price: price,
				description: description,
				userId: req.user,
			},
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array(),
		});
	}
	const imageURL = image.path;
	const product = new Product({
		title: title,
		price: price,
		imageURL: imageURL,
		description: description,
		userId: req.user,
	});
	product
		.save()
		.then((result) => {
			// console.log(result);
			console.log("Created Product");
			res.redirect("/admin/products");
		})
		.catch((err) => {
			next(err);
		});
};

exports.getEditProduct = (req, res, next) => {
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect("/");
	}
	let message = req.flash("error");
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	const prodId = req.params.productId;
	Product.findById(prodId)
		.then((product) => {
			if (!product) {
				return res.redirect("/");
			}
			res.render("admin/edit-product", {
				pageTitle: "Edit Product",
				path: "/admin/edit-product",
				editing: editMode,
				product: product,
				errorMessage: message,
			});
		})
		.catch((err) => next(err));
};

exports.postEditProduct = (req, res, next) => {
	const prodId = req.body.productId;
	const updatedTitle = req.body.title;
	const updatedPrice = req.body.price;
	const updatedImage = req.file;
	const updatedDesc = req.body.description;

	const errors = validationResult(req);
	console.log(errors);

	if (!errors.isEmpty()) {
		return res.status(422).render("admin/edit-product", {
			pageTitle: "Edit Product",
			path: "/admin/edit-product",
			editing: true,
			product: {
				_id: prodId,
				title: updatedTitle,
				price: updatedPrice,
				description: updatedDesc,
				userId: req.user,
			},
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array(),
		});
	}

	Product.findById(prodId)
		.then((product) => {
			console.log("product", product, "user", req.user._id);
			if (!product.userId.equals(req.user._id)) {
				req.flash("error", "You aren't the owner of that product");
				return res.redirect("/");
			}
			product.title = updatedTitle;
			product.price = updatedPrice;
			product.description = updatedDesc;
			if (updatedImage) {
				fileHelper.deleteFile(product.imageURL);
				const path = updatedImage.path;
				product.imageURL = path;
			}
			return product.save().then((result) => {
				console.log("UPDATED PRODUCT!");
				res.redirect("/admin/products");
			});
		})
		.catch((err) => next(err));
};

exports.getProducts = (req, res, next) => {
	let message = req.flash("error");
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	const page = +req.query.page || 1;
	let count;
	Product.countDocuments()
		.then((length) => {
			count = length;
			return Product.find({ userId: req.user._id })
				.skip((page - 1) * PRODUCTS_PER_PAGE)
				.limit(PRODUCTS_PER_PAGE);
		})
		// .select('title price -_id')
		// .populate('userId', 'name')
		.then((products) => {
			console.log(products);
			res.render("admin/products", {
				prods: products,
				pageTitle: "Admin Products",
				path: "/admin/products",
				currentPage: page || 1,
				pageCount: Math.ceil(count / PRODUCTS_PER_PAGE),
			});
		})
		.catch((err) => next(err));
};

exports.deleteProduct = (req, res, next) => {
	const prodId = req.params.id;
	Product.findById(prodId)
		.then((product) => {
			if (!product) {
				next(new Error("Product Not Found"));
			}
			fileHelper.deleteFile(product.imageURL);
			return Product.deleteOne({ _id: prodId, userId: req.user._id });
		})
		.then(() => {
			console.log("DESTROYED PRODUCT");
			res.status(200).json({ message: "Success!" });
		})
		.catch((err) => {
			res.status(500).json({ message: "Deleting Failed" });
		});
};
