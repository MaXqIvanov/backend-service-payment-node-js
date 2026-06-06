import * as dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { runPreflightChecks } from './config/bootstrap';

runPreflightChecks();

const PORT = process.env.PORT || 3000;
const RECONNECT_INTERVAL_MS = 30000;

async function startWithRetry() {
	try {
		console.log('[server]: Connecting to infrastructure (MongoDB & Redis)...');

		await connectDatabase();
		await connectRedis();

		app.listen(PORT, () => {
			console.log(`[server]: Server is running successfully on port ${PORT}`);
		});
	} catch (error) {
		console.error(
			`[server]: Infrastructure connection failed. Retrying in ${RECONNECT_INTERVAL_MS / 1000} seconds...`,
			error
		);

		setTimeout(startWithRetry, RECONNECT_INTERVAL_MS);
	}
}

startWithRetry();
