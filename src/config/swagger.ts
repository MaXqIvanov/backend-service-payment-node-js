import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Payment Processing Service API',
			version: '1.0.0',
			description: 'Автоматическая документация API сервиса платежей'
		},
		servers: [
			{
				url: 'http://localhost:3000'
			}
		]
	},

	apis: ['./src/routes/**/*.ts', './src/dtos/**/*.ts', './src/app.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
