import express from 'express';
import bodyParser from "body-parser"
import cors from 'cors';
import cookieParser from "cookie-parser";
import stocksRoute from "./routes/stocksRoutes.js"
import authRoute from "./routes/authRoutes.js"
import connectionToDatabase from './database/databaseConnection.js';
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import webPush from 'web-push';
import User from './models/userModel.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}))
app.options('*', cors()); // Allow all preflight requests
app.use(bodyParser.json());
app.use(cookieParser());
dotenv.config();
// app.use(express.static(path.join(__dirname, 'client', 'dist')));




app.get('/ping', (req, res) => {
    res.send("StockXo Api")
})
app.use("/api/", stocksRoute)
app.use("/api/auth/", authRoute)
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
// });


// Start the server
const PORT = 8000;
app.listen(PORT, () => {
  connectionToDatabase();
  console.log(`Server is running on http://localhost:${PORT}`);
});


































































    // webPush.setVapidDetails(
    //   'mailto:me@mail.com', // Contact email
    //   process.env.VAPID_PUBLIC_KEY,
    //   process.env.VAPID_PRIVATE_KEY
    // );
    
    // app.post('/api/subscribe', async(req, res) => {
    //   const { subscription, contactNumber } = req.body;
    
    //   console.log(subscription);
    //   console.log(contactNumber);
      
    
    //   const userr = await User.findOne({MobileNo : contactNumber});
    //   console.log(userr);
      
    //   userr.Notify = true;
    //   userr.NotifySubscription = subscription;
    //   await userr.save();
      
    //   console.log('New subscription:', subscription);
    
    //   res.status(201).json({ message: 'Subscription added successfully!' });
    // });