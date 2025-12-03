import express from "express";
import cors from "cors";
import 'dotenv/config';
import {connectDB} from "./config/database.js";

import adminRouter from './routes/adminRoute.js';
import productRouter from './routes/productRoute.js';


// APP CONFIG
const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARES
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


//Admin Routes
app.use('/api/admin', adminRouter);
app.use("/api/admin/products", productRouter);

//TEST
app.get("/", (req, res) => {
    res.send("API working");
});



// START SERVER
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log("Server running on PORT: " + PORT);
        })
    } catch (error) {
        console.log("Error connecting to the database: " + error)
    }
}
startServer();




