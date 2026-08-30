import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URL 
            ? (process.env.MONGO_URL.endsWith('/') ? `${process.env.MONGO_URL}chatpdf` : `${process.env.MONGO_URL}/chatpdf`)
            : process.env.MONGO_URI;

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Clean up legacy indexes (e.g., old unique username_1 index)
        try {
            const usersCollection = conn.connection.collection('users');
            const indexes = await usersCollection.indexes();
            const legacyUsernameIndex = indexes.find(
                (idx) => idx.name === 'username_1' || (idx.key && idx.key.username)
            );

            if (legacyUsernameIndex) {
                console.log('Dropping legacy index: username_1...');
                await usersCollection.dropIndex(legacyUsernameIndex.name);
                console.log('Successfully removed legacy username_1 index');
            }
        } catch (idxError) {
            // Collection might be empty or index doesn't exist, safe to ignore
            console.log('Index inspection note:', idxError.message);
        }
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
