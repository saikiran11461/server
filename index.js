
require("dotenv").config();
const { app } = require("./app");
const { connectDb } = require("./src/config/db");
const PORT = process.env.PORT || 8080;

const startServer =async()=>{
    try {
        await connectDb()

        app.listen( PORT,()=>{
            console.log(`server connected on port ${PORT}`);
        })

    } catch (error) {
        console.log("server failed to start", error);
        process.exit(1); 
    }
}

startServer()
