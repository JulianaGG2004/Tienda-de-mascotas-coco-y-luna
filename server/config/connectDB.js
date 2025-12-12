import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

if(!process.env.MONGODB_URI){
    throw new Error(
        "Por favor proveer MONGODB_URI en el archivo .env" 
    )
}

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Conectado a DB")
    } catch (error) {
        console.log("Mongodb error de conexion ", error)
        process.exit(1)
    }    
}

export default connectDB