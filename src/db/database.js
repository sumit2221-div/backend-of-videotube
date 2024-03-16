import mongoose from "mongoose";




const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.log("MONGODB_URI environment variable is not defined")
            process.exit(1)
        }
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MONGODB connection FAILED ", error)
        process.exit(1)
    }
}

export default connectDB