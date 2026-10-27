const express=require("express");
const { handleSignup, handleLogin, userProfile, handleSendOtp, handleVerifyOtp } = require("../controllers/user.controller");
const { userAuth } = require("../middlewares/userAuth");
const userRouter=express.Router();

userRouter.post("/signup",handleSignup);
userRouter.post("/login",handleLogin);
userRouter.get("/profile",userAuth,userProfile)
userRouter.post("/sendOtp",handleSendOtp)
userRouter.post("/verifyOtp",handleVerifyOtp);

module.exports={userRouter};