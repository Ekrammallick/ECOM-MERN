import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI_NEW);
    if (conn) {
      console.log(`MongoDB Connected  ${conn.connection.host}`);
    }
  } catch (error) {
    console.error(" Error connecting to MongoDb", error.message);
    process.exit(1)
  }
};
    