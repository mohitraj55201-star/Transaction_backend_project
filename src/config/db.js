const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const mongoose=require("mongoose")


async function connectToDB(){
   try{
    await mongoose.connect(process.env.MONGO_URI)

        console.log("server is connected to DB")
   }
    
    catch(err){
        console.error("Error connecting to DB:", err.message);
        throw err;
    }
}

module.exports=connectToDB;