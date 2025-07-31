import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./middlewares/errorMiddleware";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send("all working");
});

const dbUrl = process.env.MONGODB_CONNECTION_STRING;
mongoose.connect(dbUrl as string).then(() => {
  console.log("database connected successfully");
});

app.use("/api/auth", authRoutes);

app.use(errorHandler);

app.listen(8080, () => {
  console.log("server is running on port 8080");
});
