const jwt = require("jsonwebtoken")
const db = require("../../models");

/** @type {typeof import("sequelize").Model} */
const User = db.User;
const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            throw new Error("Invalid Token Please login Again");
        }
        const decodedString = await jwt.decode(token, process.env.JWT_SECRET_KEY);
        const id=decodedString.id;
        const user=await User.findByPk(id);
        if(!user){
            return res.status(409).json({
                success:false,
                message:"Authentication failed Please login again"
            })
        }
        //removing the password
        const {password:_,...safeUser} =user.toJSON();
        //attaching the user data to the request
        req.user=safeUser;    

        next();
        
    } catch (error) {
        console.log(error);
        return res.status(409).json({
            message:error.message,
        })
    }



}
module.exports = { userAuth }