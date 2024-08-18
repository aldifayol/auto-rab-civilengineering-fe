import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!, {
            dbName: 'user_auth',          // Specify database name if not in URI
            autoIndex: true,                       // Automatically build indexes
            serverSelectionTimeoutMS: 5000,        // Timeout after 5 seconds
            socketTimeoutMS: 45000,                // Socket timeout after 45 seconds
            maxPoolSize: 10,                       // Maximum connection pool size
        });
        console.log('MongoDB connected...');
    } catch (err) {
        console.error('Error connecting to MongoDB: ', err);
        process.exit(1);
    }
};

export default connectMongoDB;