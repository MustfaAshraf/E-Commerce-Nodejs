🛒 Electro - Multi-Vendor E-Commerce Platform
A full-stack E-Commerce application built with Node.js, Express, and MongoDB, featuring a complete Multi-Vendor system, Admin Dashboard, and Role-Based Access Control (RBAC).

🌟 Overview
Electro is not just a simple store; it is a Multi-Vendor Marketplace platform. It separates logic for Customers, Vendors (Product Owners), and Super Admins. Built using the MVC Architecture, it ensures clean code, security, and scalability.
It features dynamic product filtering, a secure cart system with stock management, and a visual dashboard for analytics.

🚀 Key Features
🛍️ User Experience (Customer)
Authentication: Secure Login/Register with HTTP-Only Cookies (JWT).
Dynamic Shop: Filter products by Category, Price Range, and Search.
Smart Cart: Real-time stock checks, coupon application, and total calculation.
Checkout Flow: Professional checkout with address capturing.
Order History: Users can track order status (Pending, Shipped, Delivered).
Profile Management: Update personal details and upload avatars.
💼 Vendor (Owner) Features
Data Isolation: Vendors only see and manage their own products.
Sales Analytics: Dashboard calculates revenue based only on their sold items.
Product Management: Add, Edit, and Delete products with image uploads.
🛡️ Admin (Platform) Features
Global Dashboard: Visual Charts (Chart.js) showing platform-wide revenue and sales trends.
User Management: View all users and ban/delete accounts.
Category Management: Create and manage product categories.
Coupon System: Create discount codes (Fixed/Percentage) with expiry dates.
Order Fulfillment: Update order statuses (Shipped, Delivered, Cancelled).
🛠️ Tech Stack
Backend: Node.js, Express.js
Database: MongoDB, Mongoose
Frontend: EJS (Templating Engine), Bootstrap 5
Authentication: JWT (JSON Web Tokens), bcryptjs
Validation: Express-Validator
File Handling: Multer (Image Uploads)
Visualization: Chart.js
📂 Project Structure (MVC)
code
Bash
E-Commerce-App
└── src/
    ├── controllers/    # Business logic (Product, Order, Admin...)
    ├── models/         # Mongoose Schemas (User, Cart, Coupon...)
    ├── routes/         # API Routes & Middlewares
    ├── middlewares/    # Auth, Role Checks, Uploads, Cart Loader
    ├── validations/    # Joi/Express-Validator rules
    └── views/          # EJS Templates
        ├── admin/      # Dashboard views
        ├── auth/       # Auth views
        ├── layouts/    # Layouts views
        ├── orders/     # Dashboard orders views
        ├── products/   # Dashboard Products views
        ├── shop/       # Shop views
        └── users/      # Profile views
└── uploads/
└── .env
└── app.js
⚙️ Installation & Setup
Clone the repository
code
Bash
git clone https://github.com/MustfaAshraf/E-Commerce-Nodejs.git
cd E-Commerce-Nodejs
Install Dependencies
code
Bash
npm install
Environment Variables
Create a .env file in the root directory and add:
code
Env
PORT=3000
DB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
Seed Database (Optional)
Populate the DB with dummy products, categories, and a demo admin/owner.
code
Bash
node seed.js
Run the App
code
Bash
npm start
Visit http://localhost:3000 in your browser.

🛡️ Security Measures
Role-Based Middleware: adminOnly, ownerOnly, and strictAdmin ensure users can't access unauthorized data.
Input Validation: All forms are sanitized using express-validator to prevent injection attacks.
Password Hashing: Passwords are hashed using bcrypt before storage.
Stock Safety: Backend logic prevents purchasing more items than available in stock.
🤝 Contributing
Contributions, issues, and feature requests are welcome!
👤 Author
Mustafa Ashraf
Github: @MustfaAshraf
Built with ❤️ using Node.js
