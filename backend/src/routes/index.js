import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { tasksRouter } from './tasks.routes.js';
import { usersRouter } from './users.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/tasks', tasksRouter);
