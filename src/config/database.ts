import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/payments';

export const connectDatabase = async (): Promise<void> => {
	try {
		mongoose.set('strictQuery', true);

		mongoose.connection.on('connected', () => {
			console.log('[database]: MongoDB connected successfully.');
		});

		mongoose.connection.on('error', (err) => {
			console.error(`[database]: MongoDB connection error: ${err}`);
		});

		mongoose.connection.on('disconnected', () => {
			console.warn('[database]: MongoDB disconnected.');
		});

		await mongoose.connect(MONGO_URI);
	} catch (error) {
		console.error('[database]: Failed to establish initial connection to MongoDB:', error);
		throw error;
	}
};

export const disconnectDatabase = async (): Promise<void> => {
	await mongoose.disconnect();
};
