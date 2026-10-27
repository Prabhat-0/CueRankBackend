require("dotenv").config();
const express=require("express");
const app=express();
const PORT=process.env.PORT || 3000;
app.use(express.json());

app.use("/api/v1/test",(req,res)=>{
    console.log(req);
    return res.status(200).json({message:"Successfully request initiated"});
})



app.listen(PORT,()=>{
    console.log("app is successfully running on Port :- ",PORT)
})