import express from 'express';
import controller from './controller.js';
import { authenticate } from './middleware/authenticate.js';
const router = express.Router();


router.route('/').get(authenticate, controller.create); 

export default router