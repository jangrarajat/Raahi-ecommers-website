import mongoose from "mongoose";


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL)
        console.log("dataBase is connected Successfully")
    } catch (error) {
       console.log(error.message)
       throw(error)
    }
}

export default connectDB;