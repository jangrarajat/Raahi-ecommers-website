## 🙌 Contributors
- Rajat Jangra — Full Stack Developer
 ---


# 🛒 MERN E-Commerce Backend API

This is a backend RESTful API built using **Node.js**, **Express**, and **MongoDB** for managing users, products, and likes.  
It includes **JWT-based authentication**, **Cloudinary image uploads**, and **role-based access** for owners and users.

---

## 🚀 Features

- ✅ **User Authentication & Authorization** (JWT + Cookies)
- 👤 **Role-based Access** (Owner / User)
- 🧾 **Product Management** (Add, Delete, Fetch)
- 🖼️ **Image Uploads** using **Cloudinary**
- ❤️ **Like / Dislike System**
- 🔐 **Protected Routes** via Middleware
- 🌐 **CORS Configured**
- 🍪 **Cookie-based Token Handling**
- 💾 **MongoDB Database Connection**

---

## 🧰 Tech Stack

| Layer          | Technology                  |
| -------------- | --------------------------- |
| Server         | Node.js, Express.js         |
| Database       | MongoDB (Mongoose)          |
| Authentication | JWT, bcrypt                 |
| File Upload    | Multer + Cloudinary         |
| Others         | dotenv, cookie-parser, cors |

---





# Routes


## 📍User API Routes
|     | Description    | Method | Endpoint                      |
| --- | -------------- | ------ | ----------------------------- |
| 1.  | Registration   | post   | /api/user/registration        |
| 2.  | Login          | post   | /api/user/login               |
| 3.  | Logout         | post   | /api/user/logout              |
| 4.  | RefreshToken   | post   | /api/user/refreshExpiredToken |
| 5.  | Reset Password | post   | /api/user/resetPassword       |

 ## 📍Product API Routes 
|     | Description   | Method | Endpoint                   |
| --- | ------------- | ------ | -------------------------- |
| 1.  | addNewProduct | post   | /api/product/addNewProduct |
| 2.  | deleteProduct | delete | /api/product/deleteProduct |
| 3.  | getAllProduct | get    | /api/product/getAllProduct |

 ## 📍Like API Routes 
|     | Description     | Method | Endpoint                 |
| --- | --------------- | ------ | ------------------------ |
| 1.  | Like Product    | post   | /api/like/likeProduct    |
| 2.  | DisLike product | post   | /api/like/dislikeProduct |
| 3.  | Get Like list   | get    | /api/like/likeList       |
 