import dotenv from "dotenv/config"
import express from "express"
import connectDB from "./config/database.js";
import userRouter from "./routes/userRouter.js";
import messageRouter from "./routes/messageRouter.js";
import cookieParser from "cookie-parser";
import chatRouter from "./routes/chatRouter.js";
import cors from "cors";





const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl/Postman) or allowed dev origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev environment permissive fallback
    },
    credentials: true,
  })
);

app.use("/user", userRouter);
app.use("/msg", messageRouter);
app.use("/chat", chatRouter);

// Global Error Handler Middleware (prevents hanging requests or leaking unhandled errors)
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "An unexpected server error occurred",
  });
});


// https://strikes.in/chat/getRecentChat
// https://strikes.in/chat/321
// https://strikes.in/user/login
// https://strikes.in/user/logout
// https://strikes.in/user/signup
// https://strikes.in/user/profile


// https://strikes.in/msg/read
// https://strikes.in/msg/delete
// https://strikes.in/msg/edit



// login,signup,logout,profile: user related

// chat api:

// message banege api



const startServer = async ()=>{
    try{
        
        await connectDB();

       app.listen(process.env.PORT,()=>{
        console.log(`Server has started listenting at port 3000 ${process.env.PORT}`);
       })
    }
    catch(err){
        console.log(err);
    }
}


startServer();


// server start, server listen