## 🙌 Contributors
- Rajat Jangra — Full Stack Developer
 ---

# Routes
  User Router
- Registration         post    /api/user/registration
- Login      -Authentication-          post    /api/user/login
- Logout               post    /api/user/logout
- RefreshToken         post    /api/user/refreshExpiredToken
- Reset Password       post    /api/user/resetPassword
 -
  Dashbord route 
- addNewProduct        post    /api/product/addNewProduct
- deleteProduct        delete  /api/product/deleteProduct
- getAllProduct        get     /api/product/getAllProduct
 -
  Like Route
- Like Product         post    /api/like/likeProduct
- DisLike product      post    /api/like/dislikeProduct
- Get Like list        get     /api/like/likeList



## 📍 API Routes

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET    | /api/users | Get all users |
| GET    | /api/users/:id | Get user by ID |
| POST   | /api/users/register | Register new user |
| POST   | /api/users/login | Login user |
| PUT    | /api/users/:id | Update user info |
| DELETE | /api/users/:id | Delete user |

| GET    | /api/products | Get all products |
| POST   | /api/products | Add new product |
| PUT    | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
