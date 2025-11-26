exports.getHome = (req, res) => {
  res.render('shop/index.ejs');
};

exports.getShop = (req, res) => {
  res.render('shop/shop.ejs');
};

exports.getSingleProduct = (req, res) => {
  const productId = req.params.id;
  res.render('shop/single.ejs', { productId });
};

exports.getBestSeller = (req, res) => {
  res.render('shop/bestseller.ejs');
};

exports.getCheckout = (req, res) => {
  res.render('shop/checkout.ejs');
};

exports.getContact = (req, res) => {
  res.render('shop/contact.ejs');
};

exports.getLogin = (req, res) => {
  res.render("auth/login.ejs");
};

exports.getRegister = (req, res) => {
  res.render("auth/register.ejs");
};
