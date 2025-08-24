const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const sendMail = require("./verification/mail");
const Usermodel = require("./models/User");
const verifyotp = require('./verification/verifyotp')
const verify = require('./verification/verifytoken');
const Expencemodel = require("./models/Expense");
const dotenv = require("dotenv").config();
const cors = require('cors')
mongoose.connect(process.env.MONGOPATH).then(()=>{
    console.log("mongodb connected")
}).catch((err)=>{
    console.log("mongodb not connected")
})

const app = express();
app.use(express.json());
app.use(cors())

app.post("/login", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpexpire = new Date(Date.now() + 15 * 60 * 1000); 

  try {
    let user = await Usermodel.findOne({ email });

    if (!user) {
      const newuser= await Usermodel.create({ email, otp, otpexpire });

      const sendotp = await sendMail(email,"Your Login OTP for FinTRACK",`Your OTP is ${otp}`);

      if (!sendotp) {
        return res.status(500).send({ message: "OTP sending failed" });
      }

      const token = jwt.sign({ email }, process.env.VERTOK, {expiresIn: "15m"});

      return res.status(200).send({message: "OTP sent, please check your mail",token,});
    } 
    else {
      const updateuser = await Usermodel.findOneAndUpdate({ email },{ $set: { otp, otpexpire } },{ new: true });

      const sendotp = await sendMail(email,"Your Login OTP for FinTRACK",`Your OTP Expires in 15 minutes ${updateuser.otp}`);

      if (!sendotp) {
        return res.status(500).send({ message: "OTP sending failed" });
      }

      const token = jwt.sign({ email }, process.env.VERTOK, {expiresIn: "15m",});

      return res.status(200).send({message: "OTP sent, please check your mail",token,});
    }
  } 
  catch (err) {
    console.error("Login error:", err);
    return res.status(500).send({ message: "Login error", error: err.message });
  }
});
app.post('/verifyotp',verifyotp, async (req,res)=>{
    const {otp} = req.body;
    const email = req.user.email;
    try{
        const user = await Usermodel.findOne({email})
        if(otp == user.otp){
            if(user.otpexpire < Date.now()){
                return res.send({message:"OTP expires"})
            }
            const token = jwt.sign({userId:user._id,email:email},process.env.TOKEN);
            return res.send({message:"User login successfull",Token:token})

        }
        else{
            return res.send({message:"entered incorrect otp"})
        }

    }
    catch(err){
        res.send({message:"error occurs",error:err})
    }
})

app.post("/createexpence",verify,async (req,res)=>{
    const {category,amount}=req.body
    const id = req.user.userId
    try{
        const expence = await Expencemodel.create({userId:id,category,amount})
        res.send({message:"Stored successfully"})
    }
    catch(err){
        res.send({message:'error occurs creating expence'})
    }

});


app.get('/totalamount', verify, async (req, res) => {
    const userId = req.user.userId;

    try {
        const total = await Expencemodel.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);

        res.send({ Totalamount: total[0]?.total || 0 });
    } catch (err) {
        console.error("Error in /totalamount:", err);
        res.status(500).send({ message: "Error getting total amount", error: err.message });
    }
});


app.get('/category', verify, async (req, res) => {
    const userId = req.user.userId;

    try {
        const category = await Expencemodel.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$amount" }
                }
            }
        ]);

        res.send({ data: category });
    } catch (err) {
        console.error("Aggregation error:", err);
        res.status(500).send({ message: "Error occurred while getting category data", error: err.message });
    }
});
app.get("/presentmonth",verify,async (req,res)=>{
    const userId = req.user.userId
    try{
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth()
        const start = new Date(year,month,1)
        const end = new Date(year,month+1,1)
        const category = await Expencemodel.aggregate([
            {
                $match:{
                    userId:new mongoose.Types.ObjectId(userId),
                    date:{$gte:start,$lt:end}   
                }
            },
            {
                $group:{
                    _id:"$category",
                    total:{$sum:"$amount"}
                }

            }
        ])
        res.send({data:category})

    }
    catch(err){
        res.send({message:"error occurs getting data",error:err})
    }
})
app.get('/monthtotal',verify,async(req,res)=>{
    const userId = req.user.userId;
    try{
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth()
        const start = new Date(year,month,1)
        const end = new Date(year,month+1,1)
        const total = await Expencemodel.aggregate([
            {
                $match:{
                    userId:new mongoose.Types.ObjectId(userId),
                    date:{$gte:start,$lt:end}
                }
            },
            {
                $group:{
                    _id:null,
                    total:{$sum:"$amount"}
                }
            }
        ])
        res.send({MonthExpence:total[0]?.total || 0})

    }
    catch(err){
        res.send({message:"error occurs during getting data",error:err})
    }

})

app.get('/monthlyexpences', verify, async (req, res) => {
  const userId = req.user.userId;
  const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

  try {
    const result = await Expencemodel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 } 
      }
    ]);

    const formatted = result.map(item => ({
      month: MONTH_NAMES[item._id.month - 1],
      year: item._id.year,
      totalAmount: item.totalAmount
    }));

    res.send({ data: formatted });

  } catch (err) {
    console.error("Error in /monthly-expenses:", err);
    res.status(500).send({ message: "Error getting monthly expenses", error: err.message });
  }
});
app.get("/history",verify,async(req,res)=>{
    const userId = req.user.userId;
    try{
        const history = await Expencemodel.find({userId}).sort({date:-1})
        res.send({history:history})

    }
    catch(err){
        res.send({message:"error fetching history",error:err})
    }
})

app.put('/update/:id',verify,async(req,res)=>{
    const userId = req.user.userId
    const id = req.params.id
    const {category,amount} = req.body;
    try{
        const updated = await Expencemodel.findOneAndUpdate({userId:userId,_id:id},{$set:{category,amount}},{new:true})
        if(!updated){
            res.send({message:"Update Failed"})
        }
        res.send({message:"Updated Successfully",data:updated})

    }
    catch(err){
        res.send({message:"Update failed",error:err})
    }

})

app.delete('/delete/:id', verify, async (req, res) => {
  const userId = req.user.userId;
  const expenseId = req.params.id;

  try {
    const deleted = await Expencemodel.findOneAndDelete({
      _id: expenseId,
      userId: userId
    });

    if (!deleted) {
      return res.status(404).send({ message: "Expense not found or unauthorized" });
    }

    res.send({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).send({ message: "Failed to delete expense", error: err.message });
  }
});





app.listen(5500, () => {
  console.log("Server running on port 5500");
});

