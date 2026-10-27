require("dotenv").config();
const express=require("express");
const app=express();
const PORT=process.env.PORT || 3000;
const { transporter, isConfigured, configurationError } = require("./config/mailer.js");

if (isConfigured) {
    transporter.verify()
        .then(() => console.log("Mail server ready"))
        .catch(err => console.error("Mail server error:", err.message));
} else {
    console.warn("Mail is not configured:", configurationError);
}

app.use(express.json());

app.use("/api/v1/test",(req,res)=>{
    console.log(req);
    return res.status(200).json({message:"Successfully request initiated"});
})



app.listen(PORT,()=>{
    console.log("app is successfully running on Port :- ",PORT)
})