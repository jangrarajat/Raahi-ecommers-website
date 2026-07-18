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
import reviewRouter from './routes/review.routes.js' // Add this import
import cors from 'cors'
import cookieParser from "cookie-parser";
import uploadImageRoute from './routes/uploadImage.route.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();

// ✅ Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Create uploads directory if it doesn't exist (for multer)
const uploadsDir = path.join(__dirname, 'public', 'temp');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// =============================================
// 1. MIDDLEWARE
// =============================================
app.use(cookieParser());
app.set('trust proxy', 1);

// ✅ CORS Configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ["https://raahi-ecommers-website.onrender.com"] 
        : ["http://localhost:5173", "https://rm-com.vercel.app"],
    credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());

// =============================================
// 2. DATABASE CONNECTION
// =============================================
connectDB();

// =============================================
// 3. SERVE STATIC FILES FROM PUBLIC FOLDER
// =============================================
app.use(express.static(path.join(__dirname, 'public')));

// =============================================
// 4. HEALTH CHECK
// =============================================
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: "Server is running",
        timestamp: new Date().toISOString()
    });
});

// =============================================
// 5. API ROUTES (Must be BEFORE catch-all)
// =============================================
app.use('/api/user', userRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/like', likeRouter);
app.use('/api/cart', cartRoute);
app.use('/api/limited', getLimitedProduct);
app.use('/api/address', addressRoute);
app.use("/api/order", orderRouter);
app.use('/api/upload', uploadImageRoute);
app.use('/api/review', reviewRouter); // Add this line

// =============================================
// 6. ✅ CATCH-ALL ROUTE FOR SPA (React Router)
//    Must be the LAST route
// =============================================
app.use((req, res, next) => {
    // Skip API routes (already handled above)
    if (req.path.startsWith('/api/')) {
        return next();
    }
    
    // Skip static files (already handled by express.static)
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|eot|map|webp|avif|txt|xml|pdf)$/)) {
        return next();
    }
    
    // ✅ Serve index.html for ALL OTHER routes
    // This enables client-side routing (React Router)
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =============================================
// 7. ERROR HANDLING MIDDLEWARE
// =============================================
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// =============================================
// 8. START SERVER
// =============================================
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server is live on port ${PORT}`);
    console.log(`📁 Serving static files from: ${path.join(__dirname, 'public')}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});