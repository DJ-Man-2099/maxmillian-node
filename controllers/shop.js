const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const stripe = require("stripe")(process.env.STRIPE_KEY);

const Product = require("../models/product");
const Order = require("../models/order");
const { log } = require("console");

const YOUR_DOMAIN = "http://localhost:3000";

const PRODUCTS_PER_PAGE = 1;

exports.getProducts = (req, res, next) => {
	let message = req.flash("error");
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	const page = +req.query.page;
	let count;
	Product.countDocuments()
		.then((length) => {
			count = length;
			return Product.find()
				.skip((page - 1) * PRODUCTS_PER_PAGE)
				.limit(PRODUCTS_PER_PAGE);
		})
		.then((products) => {
			res.render("shop/product-list", {
				prods: products,
				pageTitle: "All Products",
				path: "/products",
				currentPage: page || 1,
				pageCount: Math.ceil(count / PRODUCTS_PER_PAGE),
			});
		})
		.catch((err) => {
			next(err);
		});
};

exports.getProduct = (req, res, next) => {
	const prodId = req.params.productId;
	Product.findById(prodId)
		.then((product) => {
			res.render("shop/product-detail", {
				product: product,
				pageTitle: product.title,
				path: "/products",
			});
		})
		.catch((err) => next(err));
};

exports.getIndex = (req, res, next) => {
	let message = req.flash("error");
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	const page = +req.query.page;

	let count;
	Product.countDocuments()
		.then((length) => {
			count = length;
			return Product.find()
				.skip((page - 1) * PRODUCTS_PER_PAGE)
				.limit(PRODUCTS_PER_PAGE);
		})
		.then((products) => {
			res.render("shop/index", {
				prods: products,
				pageTitle: "Shop",
				path: "/",
				errorMessage: message,
				currentPage: page || 1,
				pageCount: Math.ceil(count / PRODUCTS_PER_PAGE),
			});
		})
		.catch((err) => {
			next(err);
		});
};

exports.getCheckout = (req, res, next) => {
	req.user
		.populate("cart.items.productId")
		.then(async (user) => {
			const products = user.cart.items;
			var price = 0;
			products.forEach(
				(product) => (price += product.quantity * product.productId.price)
			);

			return {
				session: await stripe.checkout.sessions.create({
					payment_method_types: ["card"],

					line_items: products.map((product) => {
						return {
							price_data: {
								currency: "usd",
								unit_amount: product.productId.price * 100,
								product_data: {
									name: product.productId.title,
									description: product.productId.description,
									images: ["https://example.com/t-shirt.png"],
								},
							},
							quantity: product.quantity,
						};
					}),
					mode: "payment",
					success_url: `${YOUR_DOMAIN}/checkout-success`,
					cancel_url: `${YOUR_DOMAIN}/cart`,
				}),
				products: products,
				price: price,
			};
		})
		.then((result) => {
			const { session, products, price } = result;
			res.render("shop/checkout", {
				path: "/checkout",
				pageTitle: "Checkout",
				products: products,
				totalPrice: price,
				sessionId: session.id,
			});
		})
		.catch((err) => next(err));
};

exports.postCheckout = async (req, res, next) => {
	/* const products = [...req.body.products].map((product) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: product.productId.title,
        },
        unit_amount: product.productId.price,
      },
      quantity: product.quantity,
    };
  });
  log(`Checking Out, products: ${products}`);
  const session = stripe.checkout.sessions
    .create({
      line_items: products,
      mode: "payment",
      success_url: "http://localhost:3000/orders",
    })
    .then((session) => {
      res.redirect(303, session.url);
    }); */

	res.send({
		clientSecret: req.body.client_secret,
	});
};

exports.getCart = (req, res, next) => {
	req.user
		.populate("cart.items.productId")
		.then((user) => {
			const products = user.cart.items;
			res.render("shop/cart", {
				path: "/cart",
				pageTitle: "Your Cart",
				products: products,
			});
		})
		.catch((err) => next(err));
};

exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	Product.findById(prodId)
		.then((product) => {
			return req.user.addToCart(product);
		})
		.then((result) => {
			console.log(result);
			res.redirect("/cart");
		});
};

exports.postCartDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	req.user
		.removeFromCart(prodId)
		.then((result) => {
			res.redirect("/cart");
		})
		.catch((err) => next(err));
};

exports.postOrder = (req, res, next) => {
	req.user
		.populate("cart.items.productId")
		.then((user) => {
			const products = user.cart.items.map((i) => {
				return { quantity: i.quantity, product: { ...i.productId._doc } };
			});
			const order = new Order({
				user: {
					email: req.user.email,
					userId: req.user,
				},
				products: products,
			});
			return order.save();
		})
		.then((result) => {
			return req.user.clearCart();
		})
		.then(() => {
			res.redirect("/orders");
		})
		.catch((err) => next(err));
};

exports.getOrders = (req, res, next) => {
	Order.find({ "user.userId": req.user._id })
		.then((orders) => {
			res.render("shop/orders", {
				path: "/orders",
				pageTitle: "Your Orders",
				orders: orders,
			});
		})
		.catch((err) => next(err));
};

exports.getInvoice = (req, res, next) => {
	const orderId = req.params.orderId;
	Order.findById(orderId)
		.then((order) => {
			if (!order) {
				return next(new Error("No Order Found"));
			}
			if (!order.user.userId.equals(req.user._id)) {
				return next(new Error("Unauthorized Access"));
			}
			const invoiceName = `invoice-${orderId}.pdf`;
			const invoicePath = path.join("data", "invoices", invoiceName);
			//For generating PDFs
			const pdfDoc = new PDFDocument();
			res.setHeader("Content-Type", "application/pdf");
			res.setHeader("Content-Disposition", `inline; filename="${invoiceName}"`);
			pdfDoc.pipe(fs.createWriteStream(invoicePath));
			pdfDoc.pipe(res);

			pdfDoc.fontSize(26).text("Invoice", {
				underline: true,
			});

			pdfDoc.text("------------------------------");
			let totalPrice = 0;
			order.products.forEach((product) => {
				totalPrice += product.quantity * product.product.price;
				pdfDoc
					.fontSize(14)
					.text(
						`${product.product.title} - ${product.quantity} x $${product.product.price}`
					);
			});
			pdfDoc.fontSize(26).text("------------------------------");

			pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`);
			pdfDoc.end();
			//For Small Files only
			/* const invoice = fs.readFile(invoicePath, (err, data) => {
        if (err) {
          return next(err);
        }
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `inline; filename="${invoiceName}"`
        );
        return res.send(data);
      });*/
			//For all files, already Located
			/* const file = fs.createReadStream(invoicePath);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${invoiceName}"`);
      file.pipe(res); */
		})
		.catch((e) => next(e));
};
