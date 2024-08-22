import connectDB from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({
    path: "./.env"
});


connectDB()
    .then(() => {
        // app.on("error", (err) =>console.log("error: ",err.message))
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT}`)
        })
    }).catch((err) => {
        console.log(`MongoDB connection failed: ${err}`)
    });