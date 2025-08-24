const mongoose = require("mongoose");


Userschema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    otp:{
        type:Number
    },
    otpexpire:{
        type:Date
    }
},{timestamps:true})

Usermodel = mongoose.model('users',Userschema)

module.exports = Usermodel;