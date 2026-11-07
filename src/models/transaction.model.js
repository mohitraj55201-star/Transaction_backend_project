const mongoose=require("mongoose")


const transactionSchema=new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Transaction must be associated with a from account"],
        index:true

    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Transaction must be associate with to account"],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["Pending","Completed","Failed","Reversed"],
            message:"Status can be either Pending,Completed,Failed or Reversed",
        },
        default:"Pending"
    },
    amount:{
        type:Number,
        required:[true,"Amount is required for creating a transaction"],
        min:[0,"Transaction cannot be negative"]
    },
    idempotencyKey:{
        type:String,
        required:[true,"Idempotency Key is required for creating a transaction"],
        unique:true
    }
},{
    timestamps:true
})

const transactionModel=mongoose.model("transaction",transactionSchema)

module.exports=transactionModel