import { Router } from 'express';
import {
    createTask,
    listTasks
} from '../controllers/tasks.controller.js';

export const tasksRouter = Router();

tasksRouter.get('/', listTasks);
tasksRouter.post('/', createTask);
