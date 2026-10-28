require("dotenv").config();
const express=require("express");
const { userRouter } = require("./routes/user.route");
const cookieParser = require("cookie-parser");
const db = require("../models");


const app=express();
const PORT=process.env.PORT || 3000;
const { transporter, configurationError } = require("./config/mailer");
const clubRouter = require("./routes/club.route");

if (configurationError) {
  console.log("Mail not configured:", configurationError);
} else {
  transporter.verify()
    .then(() => console.log("Mail server ready"))
    .catch(err => console.log("Mail server error:", err.message));
}

app.use(express.json());
app.use(cookieParser());


app.use("/api/v1",userRouter);
app.use("/api/v1",clubRouter);

app.listen(PORT,()=>{
    console.log("app is successfully running on Port :- ",PORT)
})