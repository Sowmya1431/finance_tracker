const mongoose = require("mongoose")


const ExpemceSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    category:{
        type:String,
        enum:["Travel","Health","Food",'Entertainment',"Shoping","Rent","Education","Other"],
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        default: Date.now
    }
},{timestamps:true})

const Expencemodel = mongoose.model('expences',ExpemceSchema);

module.exports = Expencemodel;
