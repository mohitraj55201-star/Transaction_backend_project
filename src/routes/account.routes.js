const express=require("express")
const authMiddleware=require("../middlewares/auth.middlewares")
const accountController=require("../controllers/account.controllers")


const router=express.Router();


 
router.post("/accounts",authMiddleware.authMiddleware,accountController.createAccountController)

 
router.get("/",authMiddleware.authMiddleware,accountController.getUserAccountsController)


router.get("/balance/:accountId",authMiddleware.authMiddleware,accountController.getAccountBalanceController)



module.exports=router;