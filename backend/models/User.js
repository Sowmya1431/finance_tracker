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
    },
    income:{
        type:Number,
        default:0
    }
},{timestamps:true})

Usermodel = mongoose.model('users',Userschema)

module.exports = Usermodel;