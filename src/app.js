
const express=require("express")
const path=require("path")
const authRouter=require("./routes/auth.routes")
const cookieParser=require("cookie-parser")
const accountRouter=require("./routes/account.routes")
const transactionRoutes=require("./routes/transaction.routes")


const app=express();


app.use(express.json())
app.use(cookieParser())


// Moved from "/" so the home page can show the website instead
app.get("/health",(req,res)=>{
    res.send("Ledger Service is up and running")
})


app.use("/api/auth",authRouter)

app.use("/api/account",accountRouter)

app.use("/api/transaction",transactionRoutes)


// Serve the built React website (made by "npm run build") from the same server.
// This must stay below the /api routes above.
const distPath=path.join(__dirname,"../frontend/dist")

app.use(express.static(distPath))

app.get("/{*splat}",(req,res,next)=>{
    if(req.path.startsWith("/api")){
        return next()
    }
    res.sendFile(path.join(distPath,"index.html"))
})

module.exports=app;