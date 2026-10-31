const express = require("express");
const { handleAdminLogin } = require("../controllers/user.controller");
const { listPendingClubs, approveClub, unApproveClub } = require("../controllers/club.controller");
const { userAuth } = require("../middlewares/userAuth");
const { validSession } = require("../middlewares/validSession");
const { authorizeRoles } = require("../middlewares/authorizeRoles");

const adminRouter = express.Router();

adminRouter.post("/login", handleAdminLogin);
adminRouter.get("/clubs/pending", userAuth, validSession, authorizeRoles("admin"), listPendingClubs);
adminRouter.patch("/clubs/:id/approve", userAuth, validSession, authorizeRoles("admin"), approveClub);
adminRouter.patch("/clubs/:id/unapprove",userAuth,validSession,authorizeRoles("admin"),unApproveClub);

module.exports = adminRouter;
