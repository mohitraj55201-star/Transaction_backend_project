const userModel=require("../models/user.model")
const jwt=require("jsonwebtoken")
const emailService=require("../services/email.services")
const tokenBlacklistModel=require("../models/blackList.Model")

async function registerUser(req,res){
    const{email,name,password}=req.body


const isExists=await userModel.findOne({
    email
})
    
         
     if(isExists){
        return res.status(422).json({
            message:"User already exists with email",
            status:"failed"
        })
     }

     const user=await userModel.create({
        email,name,password
     })
     
    const token=jwt.sign({
        userId:user._id
    },process.env.PRIVATE_KEY,{expiresIn:"3d"})

    res.cookie("token",token)

    res.status(201).json({
        user,
        token
    })
    await emailService.sendRegistrationEmail(user.email,user.name);
}


async function loginUser(req,res){
    const {email,password}=req.body;

    const user=await userModel.findOne({email}).select("+password")

    if(!user){
        return res.status(401).json({
          message:"Inavlid email or password"
        })
    }

    const isValidPassword=await user.comparePassword(password);

    if(!isValidPassword){
       return res.status(401).json({
        message:"worng password please try again"
       })
    }

    const token=jwt.sign({userId:user._id},process.env.PRIVATE_KEY,{expiresIn:"3d"})


    res.cookie("token",token)

    res.status(200).json({
        message:"Login successfully",
        user:{
        user_id: user._id,
        name: user.name,
        email: user.email
        },
        token
    })


}



async function userLogout(req,res){
    const token=req.cookies.token||req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(400).json({
            message:"user logout successfully"
        })
    } 
    res.cookie("token","")

    await tokenBlacklistModel.create({
        token:token
    })

    res.status(200).json({
        message:"user logout successfully"
    })

}




module.exports={registerUser,loginUser,userLogout};