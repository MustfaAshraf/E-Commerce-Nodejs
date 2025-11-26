const express = require('express');
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require("cookie-parser");


const app = express();

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const url = process.env.MONGO_URL;

mongoose.connect(url).then(() => {
    console.log('mongodb server started')
})
// Static files
app.use(express.static('public'));
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
const shopRoutes = require('./src/routes/shop.routes');
const categoryRoutes = require('./src/routes/category.routes');
const productRoutes = require('./src/routes/product.routes');
const cartRoutes = require('./src/routes/cart.routes');
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const orderRoutes = require('./src/routes/order.routes');
const couponRoutes = require('./src/routes/coupon.routes');

const setUser = require('./src/middlewares/setUser.middleware');

app.use(setUser);  // <-- SAFE, public friendly


app.use(require('./src/middlewares/loadCategories.middleware'));

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/my/cart', cartRoutes);
app.use('/users', userRoutes);
app.use('/orders', orderRoutes);
app.use('/coupons', couponRoutes);


app.use('/', shopRoutes);

// global middleware for not found routes
app.use((req, res) => {
    res.status(404).render('shop/404');
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
