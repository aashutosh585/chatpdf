import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Prefer MONGO_URL (Atlas) if available, else MONGO_URI
        const uri = `${process.env.MONGO_URL}/chatpdf` ;
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
