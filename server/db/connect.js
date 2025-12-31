import mongoose from 'mongoose'

const connectDB = async (url) => {
  try{
    await mongoose.connect(url);
    // console.log("Connected to DB")
  } catch(err){
    console.log("MongoDB connection error: ", err.message)
    process.exit(1)
  }
}

export default connectDB;