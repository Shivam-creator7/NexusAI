import jwt from "jsonwebtoken"
import User from "../model/userSchema.js"

const authUserMiddleware = async(req,res,next)=>{

    try{
        
        const {token} = req.cookies;

        if(!token){
            return res.status(401).json({
                message: "You need to login First"
            })
        }
        
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const existingUser = await User.findById(payload.id);

        if (!existingUser) {
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
            return res.status(401).json({
                message: "User session invalid or user does not exist"
            });
        }

        // Upgrade token limit to 1 million (1,000,000) if needed
        if (!existingUser.usage?.tokenLimit || existingUser.usage.tokenLimit < 1000000) {
            if (!existingUser.usage) {
                existingUser.usage = { tokenUsed: 0, tokenLimit: 1000000, resetAt: new Date(Date.now() + 5 * 60 * 60 * 1000), totalTokenUsed: 0 };
            } else {
                existingUser.usage.tokenLimit = 1000000;
            }
            await existingUser.save();
        }
        
        req.user = existingUser;
        next();

    }
    catch(err){
        console.log("Auth middleware error:", err.message);
        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
            return res.status(401).json({ message: "Invalid or expired session. Please login again." });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
}


export default authUserMiddleware;