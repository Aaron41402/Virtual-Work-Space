import mongoose from "mongoose";

const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
    } catch (e) {
        console.error("Mongoose Error: " + e.message);
    }
};

export default connectMongo;