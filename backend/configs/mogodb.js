import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => console.log("Database Connected"))
    mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err))

    const baseUri = process.env.MONGODB_URI
    if (!baseUri) {
      throw new Error('MONGODB_URI is not set in environment variables')
    }

    const uri = baseUri.includes('mongodb') ? baseUri : `${baseUri}/lms`
    await mongoose.connect(uri, { 
      dbName: uri.includes('/') ? undefined : 'lms'
    })
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message)
    throw error
  }
}

export default connectDB;
