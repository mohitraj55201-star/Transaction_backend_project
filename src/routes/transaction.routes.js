const express=require("express")
const authMiddleware=require("../middlewares/auth.middlewares")
const transactionController=require("../controllers/transaction.controllers")


const transactionRoutes=express.Router();


transactionRoutes.post("/",authMiddleware.authMiddleware,transactionController.createTransaction )


transactionRoutes.post("/system/initial-funds",authMiddleware.authSystemMiddleware,transactionController.createInitialFundsTransaction)


module.exports=transactionRoutes;