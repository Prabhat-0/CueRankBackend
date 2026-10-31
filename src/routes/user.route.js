const express=require("express");
const { handleSignup, handleLogin, userProfile, handleSendOtp, handleVerifyOtp, updatePassword, updateProfile } = require("../controllers/user.controller");
const { userAuth } = require("../middlewares/userAuth");
const { validSession } = require("../middlewares/validSession");
const { authorizeRoles } = require("../middlewares/authorizeRoles");
const userRouter=express.Router();

userRouter.post("/signup",handleSignup);
userRouter.post("/login",handleLogin);
userRouter.get("/profile",userAuth,validSession,authorizeRoles("player"),userProfile)
userRouter.post("/sendOtp",handleSendOtp)
userRouter.post("/verifyOtp",handleVerifyOtp);
userRouter.patch("/updatePassword",userAuth,validSession,authorizeRoles("player"),updatePassword);
userRouter.patch("/updateProfile",userAuth,validSession,authorizeRoles("player"),updateProfile);

module.exports={userRouter};