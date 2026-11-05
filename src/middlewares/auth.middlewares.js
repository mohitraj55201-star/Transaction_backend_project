const { tokenBlacklistModel } = require("../models/blackList.Model")
const userModel=require("../models/user.model")
const jwt=require("jsonwebtoken")


async function authMiddleware(req,res,next){
    const token=req.cookies.token||req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message:"Unauthorizedd access,token is missing"
        })
    }

    const isBlacklisted=await tokenBlacklistModel.findOne({token})

    if(isBlacklisted){
        return res.status(401).json({
            message:"unauthorized access,token is invalid"
        })
    }

    try{
        const decoded=jwt.verify(token,process.env.PRIVATE_KEY)
         
        const user=await userModel.findById(decoded.userId)

        req.user=user

        return next()

    }catch(err){
        return res.status(401).json({
            message:"Unauthorized acces,token is missing"
        })
    }
}

async function authSystemMiddleware(req,res,next){
    const token =req.cookies.token|| req.headers.authorization?.split("")[1]

    if(!token){
        return res.status(401).json({
            message:"Unauthrized access,token is missing"
        })
    }
     const isBlacklisted=await tokenBlacklistModel.findOne({token})

    if(isBlacklisted){
        return res.status(401).json({
            message:"unauthorized access,token is invalid"
        })
    }

    
    try{
        const decoded=jwt.verify(token,process.env.PRIVATE_KEY)

        const user=await userModel.findById(decoded.userId).select("+systemUser")
        if(!user.systemUser){
            return res.status(403).json({
               message:"Forbidden access,not a system user" 
            })
        }
        req.user=user
        return next()
    }
    catch(err){
        return res.status(401).json({
            message:"Unauthorized access,token is invalid"
        })
    }
}


module.exports={
    authMiddleware,authSystemMiddleware
}