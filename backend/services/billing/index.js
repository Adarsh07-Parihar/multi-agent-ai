import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import router from "./routes/billing.route.js";


dotenv.config();

const app = express();

const PORT = process.env.PORT

// Connect Database
connectDb();

// Middlewares
app.use(express.json());
app.use("/",router)

// Health Check
app.get("/", (req, res) => {
    res.json({message:"hello from billing"});
});



const startServer = async () => {
    try {


        app.listen(PORT, () => {
            console.log(`🚀 Billing Service running on port ${PORT}`);
        });

    } catch (error) {

        console.error("Failed to start Billing Service");

        process.exit(1);

    }
};

startServer();