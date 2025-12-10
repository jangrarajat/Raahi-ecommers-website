import express from 'express';
import 'dotenv/config';
import connectDB from './db/configDB.js';
import userRoute from './routes/user.route.js';
import dashboardRoute from './routes/dashboard.route.js'
import likeRouter from './routes/likeProduct.route.js'
import cartRoute from './routes/cart.route.js'
import getLimitedProduct from './routes/product.route.js'
import addressRoute from './routes/address.route.js'
import orderRouter from './routes/order.routes.js'
import cors from 'cors'
import cookieParser from "cookie-parser";

const app = express();



app.use(cookieParser()); // config  cookie Parser

app.set('trust proxy', 1);

app.use(cors({
    origin: ["http://localhost:5173", "https://rm-com.vercel.app"], // tumhara frontend URL
    credentials: true
}));  // config cord
app.use(express.json())   // config json
connectDB()  // connect data base 



app.get('/', (req, res) => {
    res.status(200).send("hello")
})

app.use('/api/user', userRoute)   // user route
app.use('/api/dashboard', dashboardRoute)   //dashboard  route
app.use('/api/like', likeRouter)   // like route
app.use('/api/cart', cartRoute) // cart route

app.use('/api/limited', getLimitedProduct)
app.use('/address', addressRoute)
app.use("/api/order", orderRouter);




app.listen(process.env.PORT, () => {
    console.log(`server is live on ${process.env.PORT} `)
})