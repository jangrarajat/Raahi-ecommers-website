import express from 'express';
import 'dotenv/config';
import connectDB from './db/configDB.js';
import userRoute from './routes/user.route.js';
import productRoute from './routes/dashboard.route.js'
import cors from 'cors'
import cookieParser from "cookie-parser";
 
const app = express();



app.use(cookieParser()); // config  cookie Parser
 
app.use(cors())    // config cord
app.use(express.json())   // config json
connectDB()  // connect data base 



app.get('/',(req,res)=>{
    res.status(200).send("hello")
})

app.use('/api/user',userRoute)   // user route
app.use('/api/product',productRoute)   // user route

app.listen(process.env.PORT , ()=>{
    console.log(`server is live on ${process.env.PORT} `)
})