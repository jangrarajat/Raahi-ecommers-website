# 🛒 Raahi-E-Commers — Backend (Node.js + Express + MongoDB)

This is a complete backend for an e-commerce application built using **Node.js**, **Express**, and **MongoDB**.  
It includes **Authentication**, **OTP-based Password Reset**, **Product Management**, **Cart System**, **Like System**, and **Admin Role Management**.

---

## 🚀 Features

### 🔐 Authentication & User Management
- User Registration
- User Login
- Secure Logout
- JWT-based Access & Refresh Tokens
- Refresh Expired Token API
- Reset Password (Logged-in user)
- Forget Password with:
  - Email-based OTP send
  - OTP verification
  - Forget Password Token
  - Set New Password securely (hashed)
- Owner/Admin role system

---

### 🛍 Product Management
- Add New Product (Admin only)
- Upload Product Images to Cloudinary
- Get All Products
- Get Products by Category
- Get Products with Pagination
- Delete Product (Admin only)

---

### ❤️ Like System
- Like a Product
- Dislike (Unlike) Product
- Get Like List (with product details)

---

### 🛒 Cart System
- Add Product to Cart
- Remove Product from Cart
- Get User Cart List (with product info)

---

## 📁 Project Folder Structure

 project/
│── controllers/
│── models/
│── routes/
│── utils/
│── config/
│── middlewares/
│── uploads/
│── index.js
│── .env
│── package.json


---

## 🔧 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Bcrypt Password Hashing**
- **Cloudinary for Image Upload**
- **Nodemailer for OTP Emails**
- **Cookie-based Auth**

---

## 🔑 Environment Variables (`.env`)

PORT=5000
MONGO_URI=your_mongodb_url

ACCESS_TOKEN_SECRET=your_access_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_jwt_secret
FORGET_PASSWORD_TOKEN_SECRET=your_forget_password_secret

NODEMAILER_USER=your_email
NODEMAILER_PASS=your_email_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

OWNER_EMAIL=admin_email@example.com



---

## 📌 API Endpoints

### 👤 User APIs
POST /api/user/registration
POST /api/user/login
POST /api/user/logout
POST /api/user/refreshExpiredToken
PATCH /api/user/resetPassword
POST /api/user/forgetPassword
POST /api/user/verifyOtp
POST /api/user/setForgetPassword


---

### 🛒 Cart APIs
GET /api/cart/getCartList
POST /api/cart/addToCart
POST /api/cart/disCartProduct



---

### ❤️ Like APIs
POST /api/like/likeProduct
POST /api/like/disLikeProduct
GET /api/like/getLikeList


---

### 🛍 Product APIs (Admin Only)
POST /api/product/addNewProduct
DELETE /api/product/deleteProduct/:id
GET /api/product/getAllProduct
GET /api/product/product (category filter)


---

## 🔐 Authentication Flow

### 1. User Login  
- User receives a **JWT access token** + **refresh token**  
- Tokens are stored in cookies

### 2. Forgot Password  
- User enters email  
- Server sends OTP  
- OTP verified → forget password token created  
- User sets new password (with automatic hashing)

---

## 📸 Cloudinary Image Upload
- Product images are uploaded via multipart/form-data
- Stored securely on Cloudinary
- URL saved in product document

---

## 👑 Role Based Access
Admin/Owner identified using `OWNER_EMAIL` from env.  
Admin can:
- Add products  
- Delete products  
- Access admin APIs  

Normal user cannot access these.

---


