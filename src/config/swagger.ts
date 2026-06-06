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

	apis: [
		'./src/routes/**/*.[tj]s',
		'./src/dtos/**/*.[tj]s',
		'./dist/src/routes/**/*.[tj]s',
		'./dist/src/dtos/**/*.[tj]s',
		'./dist/routes/**/*.[tj]s',
		'./dist/dtos/**/*.[tj]s',
		'./src/app.[tj]s',
		'./dist/app.[tj]s'
	]
};

export const swaggerSpec = swaggerJsdoc(options);
