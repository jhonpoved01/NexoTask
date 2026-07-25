import { Router } from 'express';
import {
    createUser,
    listUsers
} from '../controllers/users.controller.js';

export const usersRouter = Router();

usersRouter.get('/', listUsers);
usersRouter.post('/', createUser);
