import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Инициализируем клиент Redis
export const redisClient = createClient({
	url: REDIS_URL
});

// Слушатели событий для мониторинга состояния подключения
redisClient.on('connect', () => {
	console.log('[redis]: Redis client initializing connection...');
});

redisClient.on('ready', () => {
	console.log('[redis]: Redis client connected and ready to use.');
});

redisClient.on('error', (err) => {
	console.error(`[redis]: Redis Client Error: ${err}`);
});

redisClient.on('end', () => {
	console.warn('[redis]: Redis connection closed.');
});

/**
 * Функция для безопасного подключения к Redis
 */
export const connectRedis = async (): Promise<void> => {
	try {
		if (!redisClient.isOpen) {
			await redisClient.connect();
		}
	} catch (error) {
		console.error('[redis]: Failed to connect to Redis:', error);
		throw error; // Пробрасываем ошибку выше, чтобы остановить сервер при сбое инфраструктуры
	}
};

/**
 * Функция для закрытия соединения (понадобится в тестах)
 */
export const disconnectRedis = async (): Promise<void> => {
	if (redisClient.isOpen) {
		await redisClient.disconnect();
	}
};
