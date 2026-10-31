const jwt = require("jsonwebtoken")

const generateJwt=(id, role)=>{
    return jwt.sign({ id, role }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRY });
    
};
module.exports={generateJwt}