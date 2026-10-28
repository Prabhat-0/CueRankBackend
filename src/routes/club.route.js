const express=require("express");
const { registerClub } = require("../controllers/club.controller");
const clubRouter=express.Router();

clubRouter.post("/registerClub",registerClub);

module.exports=clubRouter