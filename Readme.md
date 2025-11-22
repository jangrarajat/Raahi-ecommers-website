# Raahi E-Commerce Backend API 🚀

Welcome to the *Raahi E-Commerce Backend API*! This project is a robust, scalable, and feature-rich RESTful API designed to power a modern e-commerce platform. Built with Node.js and Express, it provides all the essential functionalities for user management, product handling, shopping cart operations, order processing, and admin controls.

---

## 🌟 Key Features & Highlights

This API covers a comprehensive set of features crucial for any e-commerce application:

### 1. User Authentication & Authorization 🔒
-   *Secure Registration & Login:* Standard user registration and login with password hashing (bcrypt).
-   *JWT-based Authentication:* JSON Web Tokens (JWT) for secure session management.
-   *Refresh Token Logic:* Implemented for seamless user experience, handling token expiry without frequent re-login.
-   *Role-Based Access Control (RBAC):* Differentiates between 'user' and 'owner' (admin) roles, restricting access to sensitive endpoints.
-   *Forgot & Reset Password:* Secure OTP-based email verification (Nodemailer) for password reset.

### 2. Product Management 📦
-   *Admin Product Operations:* Owners can add new products with image uploads (Cloudinary), delete existing products, and update delivery availability for pincodes.
-   *Dynamic Product Listing:* Users can fetch products with *pagination* and filter by category (e.g., "man", "ladies", "all").
-   *Product Liking/Wishlist:* Functionality to like/dislike products and view a personal wishlist.

### 3. Shopping Cart & Order Workflow 🛒
-   *Intelligent Cart Handling:* handleCartProduct intelligently increments quantity if a product already exists in the cart, or adds it as a new item.
-   *Cart List & Total Price:* Users can view their cart with populated product details and an automatically calculated total price.
-   *Place Order:* A comprehensive workflow to convert cart items into an order, associate it with an address, and clear the cart upon successful order placement.
-   *Order Status Management:* Admin can view all orders and update their statuses (pending, shipped, delivered). Users can view their personal order history and cancel pending orders.

### 4. Address & Delivery Management 📍
-   *User Address Management:* Users can add multiple addresses, retrieve all their saved addresses, and set a default shipping address.
-   *Advanced Address Validation:* A custom middleware (validateAddress) ensures all required address fields are present, validates phone and pincode formats, and checks if the provided pincode is a deliverable service area (managed by admin).
-   *Service Area Control (Admin):* Owners can add new service pincodes and toggle their delivery availability.

### 5. Cloud Integration & Utilities ☁
-   *Cloudinary Image Upload:* Seamless integration with Cloudinary for handling product images (uploading and deleting).
-   *Nodemailer Email Service:* Used for sending OTPs for password reset functionality.

---

## 🛠 Technologies Used

* *Backend:* Node.js, Express.js
* *Database:* MongoDB (with Mongoose ODM)
* *Authentication:* JWT (JSON Web Tokens), bcrypt for password hashing
* *File Upload:* Multer (for local storage before Cloudinary upload)
* *Cloud Storage:* Cloudinary
* *Email Service:* Nodemailer
* *Environment Variables:* dotenv
* *Other:* cookie-parser, cors

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v18 or higher recommended)
* MongoDB ( MongoDB Atlas)
* Cloudinary Account
* Gmail Account (for Nodemailer)

### Installation

1.  *Clone the repo:*
    bash
    git clone [https://github.com/jangrarajat/Raahi-ecommers-website.git]
    cd Raahi-ecommers-website
    
2.  *Install NPM packages:*
    bash
    npm install
    
3.  *Set up Environment Variables:*
    Create a .env file in the root directory and add the following:
    env
    PORT=8000
    MONGODB_URI="your_mongodb_connection_string"

    ACCESS_TOKEN_SECRET="a_very_secret_access_key"
    ACCESS_TOKEN_EXPIR="1h"
    REFRESH_TOKEN_SECRET="a_very_secret_refresh_key"
    REFRESH_TOKEN_EXPIR="7d"
    FORGET_PASSWORD_TOKEN_SECRET="a_very_secret_forget_password_key"
    FORGET_PASSWORD_TOKEN_EXPIR="15m"

    CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
    CLOUDINARY_API_KEY="your_cloudinary_api_key"
    CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

    EMAIL_USER="your_gmail_email@gmail.com"
    EMAIL_PASS="your_gmail_app_password" # Generate an App Password if using Gmail

    OWNER_EMAIL="admin@example.com" # Email for the admin account
    
    Make sure to replace placeholder values with your actual credentials.

4.  *Run the application:*
    bash
    npm start
    
    The server will start on the port specified in your .env file (e.g., http://localhost:8000).

---

 

 

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are *greatly appreciated*.

1.  Fork the Project
2.  Create your Feature Branch (git checkout -b feature/AmazingFeature)
3.  Commit your Changes (git commit -m 'Add some AmazingFeature')
4.  Push to the Branch (git push origin feature/AmazingFeature)
5.  Open a Pull Request

---

 

## 📞 Contact

  Name - Rajat Jangra
  Email - [rajatjangra940@gmail.com]
Project Link: [https://github.com/jangrarajat/Raahi-ecommers-website.git]

---