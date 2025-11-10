import { Schema, mongoose  }  from "mongoose";
import bcrypt from 'bcrypt'



const userSchema = new Schema({
    username: {
        type: String,
        requried: true
    },
    email: {
        type: String,
        requried: true
    },
    password: {
        type: String,
        requried: true
    },
      refreshToken: {
        type: String,
       
    },

}, { timestamps: true })


userSchema.pre('save', async function (next) {
    
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

 const  User = mongoose.model('User', userSchema);

  export default User ;