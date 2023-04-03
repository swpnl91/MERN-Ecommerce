import mongoose from "mongoose";
import colors from "colors";

// In order to connect to MongoDB
const connectDB = async () => {
  
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(
      `Connected To MongoDB Database ${conn.connection.host}`.bgMagenta.white
    );
  } catch (error) {
    console.log(`MongoDB connection Error - ${error}`.bgRed.white);     // .bgRed.white comes from 'colors' package
  }

};

export default connectDB;