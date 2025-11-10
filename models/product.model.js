import { Schema, mongoose } from 'mongoose'

const productSchema = new Schema({
   name:{
    type:String,
    requrid:true
   },
    descraption:{
    type:String,
    requrid:true
   },
    imageUrl:{
    type:String,
    requrid:true
   },
     price:{
    type:Number,
    requrid:true
   },
    quantity:{
    type:Number,
    requrid:true
   },
    category:{
    type:String,
    requrid:true
   },
}, { timestamps: true })

const Product = mongoose.model("Product" , productSchema)

export default Product