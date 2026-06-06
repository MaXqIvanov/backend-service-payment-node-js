/**
 * Единая функция предстартовой проверки бэкенда.
 * Проверяет наличие всех критически важных параметров окружения.
 */
export const runPreflightChecks = (): void => {
	console.log('[bootstrap]: Running system preflight checks...');

	// Список всех параметров, без которых сервер не имеет права запускаться
	const REQUIRED_ENV_VARIABLES = ['PORT', 'MONGO_URI', 'REDIS_URL', 'WEBHOOK_SECRET'] as const;

	for (const variable of REQUIRED_ENV_VARIABLES) {
		if (!process.env[variable]) {
			throw new Error(`CRITICAL: ${variable} environment variable is missing!`);
		}
	}

	console.log('[bootstrap]: All preflight checks passed successfully.');
};
