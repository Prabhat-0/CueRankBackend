const express=require("express");
const { registerClub, loginClub, clubProfile, changeClubPassword } = require("../controllers/club.controller");
const { userAuth } = require("../middlewares/userAuth");
const { validSession } = require("../middlewares/validSession");
const { authorizeRoles } = require("../middlewares/authorizeRoles");
const clubRouter=express.Router();

clubRouter.post("/registerClub",registerClub);
clubRouter.post("/login",loginClub);
clubRouter.get("/profile",userAuth,validSession,authorizeRoles("club"),clubProfile);
clubRouter.patch("/changePassword",userAuth,validSession,authorizeRoles("club"),changeClubPassword);
// clubRouter.patch("/clubs/:id/unapprove",userAuth,validSession,authorizeRoles("club"),unApproveClub)

module.exports=clubRouter;