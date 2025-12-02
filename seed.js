require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/category.model');
const Product = require('./src/models/product.model');
const User = require('./src/models/users.model');

// Database Connection
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/electro-shop')
    .then(() => console.log('✅ Connected to MongoDB for Seeding'))
    .catch(err => console.log(err));

const seedData = async () => {
    try {
        // 1. Get an Owner (We need a user ID for the 'owner' field)
        // We grab the first user found, or create a dummy one if none exist.
        let owner = await User.findOne();
        if (!owner) {
            console.log('⚠️ No users found. Creating a dummy admin...');
            owner = await User.create({
                name: "Admin Seeder",
                email: "admin@seed.com",
                password: "hashedpassword123", // Dummy hash
                role: "admin",
                address: { country: "US", city: "NY", street: "Wall St" }
            });
        }

        // 2. Clear existing data (Optional: Comment out if you want to keep old data)
        await Product.deleteMany({});
        await Category.deleteMany({});
        console.log('🧹 Old data cleared.');

        // 3. Create Categories
        const catElectronics = await Category.create({ name: 'Electronics' });
        const catLaptops = await Category.create({ name: 'Laptops' });
        const catCameras = await Category.create({ name: 'Cameras' });
        const catPhones = await Category.create({ name: 'Smartphones' });
        const catAccessories = await Category.create({ name: 'Accessories' });
        
        console.log('fyp Categories created.');

        // 4. Create Products (Using template image names so they look good)
        const products = [
            {
                name: "Canon EOS Rebel T7",
                description: "Capture the world with stunning detail using the EOS Rebel T7. Perfect for beginners and pros.",
                price: 450.00,
                quantity: 10,
                category: catCameras._id,
                image: "product-1.png", // Template image
                owner: owner._id
            },
            {
                name: "Smart Watch Series 7",
                description: "Stay connected, active, and healthy with the new Smart Watch Series 7.",
                price: 120.00,
                quantity: 50,
                category: catAccessories._id,
                image: "product-2.png",
                owner: owner._id
            },
            {
                name: "iPhone 14 Pro Max",
                description: "The ultimate smartphone experience with a 48MP camera and A16 Bionic chip.",
                price: 1099.00,
                quantity: 15,
                category: catPhones._id,
                image: "product-3.png",
                owner: owner._id
            },
            {
                name: "Sony Alpha a7 III",
                description: "Full-frame mirrorless interchangeable lens camera with 24.2MP sensor.",
                price: 1998.00,
                quantity: 5,
                category: catCameras._id,
                image: "product-4.png",
                owner: owner._id
            },
            {
                name: "MacBook Air M2",
                description: "Supercharged by M2. Strikingly thin design. All-day battery life.",
                price: 1199.00,
                quantity: 8,
                category: catLaptops._id,
                image: "product-5.png",
                owner: owner._id
            },
            {
                name: "Samsung Galaxy S23",
                description: "Epic shots with Nightography. The fastest chip on a Galaxy device.",
                price: 899.00,
                quantity: 20,
                category: catPhones._id,
                image: "product-6.png",
                owner: owner._id
            },
            {
                name: "Dell XPS 13",
                description: "13-inch laptop designed with precision engineered details and stunning views.",
                price: 999.00,
                quantity: 12,
                category: catLaptops._id,
                image: "product-7.png",
                owner: owner._id
            },
            {
                name: "Wireless Headphones",
                description: "Noise cancelling over-ear headphones with 30-hour battery life.",
                price: 150.00,
                quantity: 30,
                category: catAccessories._id,
                image: "product-8.png",
                owner: owner._id
            },
            {
                name: "iPad Mini 6",
                description: "Mega power. Mini sized. All-screen design with 8.3-inch Liquid Retina display.",
                price: 499.00,
                quantity: 25,
                category: catElectronics._id,
                image: "product-9.png",
                owner: owner._id
            },
            {
                name: "GoPro HERO11",
                description: "Ultra versatility and maximum performance. The most powerful GoPro yet.",
                price: 399.00,
                quantity: 10,
                category: catCameras._id,
                image: "product-10.png",
                owner: owner._id
            },
            {
                name: "Gaming Mouse",
                description: "High precision optical gaming mouse with customizable RGB lighting.",
                price: 45.00,
                quantity: 100,
                category: catAccessories._id,
                image: "product-11.png",
                owner: owner._id
            },
            {
                name: "4K Monitor 27-inch",
                description: "Stunning 4K UHD resolution with HDR10 support for content creators.",
                price: 350.00,
                quantity: 10,
                category: catElectronics._id,
                image: "product-1.png", // Reusing image
                owner: owner._id
            }
        ];

        await Product.insertMany(products);
        console.log('🚀 12 Products inserted successfully!');
        
        process.exit();
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();