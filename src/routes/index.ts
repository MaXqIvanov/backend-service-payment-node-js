import { Router } from 'express';
import systemRoutes from './system.routes';
import invoiceRoutes from './invoice.routes';
import webhookRoutes from './webhook.routes';

const mainRouter = Router();

mainRouter.use('/', systemRoutes);
mainRouter.use('/invoice', invoiceRoutes);
mainRouter.use('/webhook', webhookRoutes);

export default mainRouter;
