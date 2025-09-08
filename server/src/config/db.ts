import mongoose from "mongoose";
import { ErrorHandler } from "../utils/errorHandler";

const dbUrl = process.env.MONGODB_CONNECTION_STRING;

const connectDb = async () => {
  try {
    if (!dbUrl) {
      throw new ErrorHandler("MONGODB_CONNECTION_STRING is not defined", 500);
    }

    await mongoose.connect(dbUrl);
    console.log("Database connected successfully");
  } catch (error: any) {
    throw new ErrorHandler(`DB connection failed: ${error.message}`, 500);
  }
};

export default connectDb;
