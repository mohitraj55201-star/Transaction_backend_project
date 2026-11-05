const transactionModel=require("../models/transaction.model")
const ledgerModel=require("../models/ledger.model")
const accountModel=require("../models/account.model")
const emailServices=require("../services/email.services")
const mongoose=require("mongoose")


async function  createTransaction(req,res){
    const {fromAccount,toAccount,amount,idempotencyKey}=req.body;

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
       return res.status(400).json({
            message:"FromAccount,toACcount,amount and idempotencyKey is required"
        })
    }


    const fromUserAccount=await accountModel.findOne({
        _id:fromAccount,
    })
    

    const toUserAccount=await accountModel.findOne({
        _id:toAccount,
    })

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message:"Invalid fromAccount or toAccount"
        })
    }

    const isTransactionAlreadyExists=await transactionModel.findOne({
        idempotencyKey:idempotencyKey
    })

    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status==="Completed"){
           return res.status(200).json({
                message:"Transaction already processed ",
                transaction:isTransactionAlreadyExists
            })
        }
        if(isTransactionAlreadyExists.status==="Pending"){
           return res.status(200).json({
                message:"Transaction is still processing",
            })
        }
        if(isTransactionAlreadyExists.status==="Failed"){
           return res.status(500).json({
                message:"Transaction processing failed,please retry"
            })
        }
        if(isTransactionAlreadyExists.status==="Reversed"){
           return res.status(500).json({
                message:"Transaction was reversed,please retry"
            })
        }

    }

    if(fromUserAccount.status!=="ACTIVE" || toUserAccount.status!=="ACTIVE"){
        return res.status(400).json({
            message:"both fromAccount and toAccount must be Active to process transaction"
        })
    }

    const balance=await fromUserAccount.getBalance()

    if(balance<amount){
        return res.status(400).json({
            message:`Insufficient balance.Current balance is ${balance}.Requested amount is ${amount}`
        })
    }

    let transaction;
    
    try{
    const session=await mongoose.startSession()
    session.startTransaction()


        transaction=(await  transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status:"Pending"
    }],{session}))[0]

    const debitLedgerEntry=await ledgerModel.create([{
        account:fromAccount,
        amount:amount,
        transaction:transaction._id,
        type:"DEBIT"
    }],{session})
   
    await (()=>{
        return new Promise((resolve)=>setTimeout(resolve,15*1000));
    })();


        const creditLedgerEntry=await ledgerModel.create([{
        account:toAccount,
        amount:amount,
        transaction:transaction._id,
        type:"CREDIT"
    }],{session})

    await transactionModel.findOneAndUpdate(
        {_id:transaction._id},
        {status:"Completed"},
        {session}
    )


    await session.commitTransaction()
    session.endSession()

}catch(err){
    return res.status(400).json({
        message:"Transaction is pending due to some issue,please retry after some time" 
    })
}


    await emailServices.sendTransactionEmail(req.user.email,req.user.name,amount,toAccount)
     const updatedTransaction = await transactionModel.findOne({
    _id: transaction._id
});
    return res.status(201).json({
        message:"Transaction completed successfully",
        transaction:updatedTransaction
    })

}

async function createInitialFundsTransaction(req,res){
    const {toAccount,amount,idempotencyKey}=req.body
    if(!toAccount|| !amount|| !idempotencyKey){
        return res.status(400).json({
            message:"toAccount,amount and idempotencyKey are required"
        })
    }
    const toUserAccount=await accountModel.findOne({
    _id:toAccount,
    })
    if(!toUserAccount){
        return res.status(400).json({
            message:"Invalid toAccount"
        })
    }
    const fromUserAccount=await accountModel.findOne({
        user:req.user._id
    })
    if(!fromUserAccount){
       return res.status(400).json({
        message:"System user account not found"
       })
    }

    const session=await mongoose.startSession()
    session.startTransaction()

    const transaction=await transactionModel({
        fromAccount:fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status:"Pending"
    })

    const debitLedgerEntry=await ledgerModel.create([{
        account:fromUserAccount._id,
        amount:amount,
        transaction:transaction._id,
        type:"DEBIT"

    }],{session})

    const creditLedgerEntry=await ledgerModel.create([{
        account:toAccount,
        amount:amount,
        transaction:transaction._id,
        type:"CREDIT"
    }],{session})

    transaction.status="Completed"
    await transaction.save({session})

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message:"Initial funds transaction completed successfully",
        transaction:transaction
    })

}


module.exports={
    createTransaction,
    createInitialFundsTransaction
}