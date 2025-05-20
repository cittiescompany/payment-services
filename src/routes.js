import express from 'express';
import controller from './controller.js';
import { authenticate } from './middleware/authenticate.js';
import valiVends from './middleware/billMidleWare.js';
const router = express.Router();


router.route('/transactions/:page').get(authenticate, controller.transactions); 
// router.route('/reserve_account').get(authenticate, controller.create); 
router.route('/generate_account').get(authenticate, controller.generateReserveAccount); 
router.route('/generate_virtual_account').post(authenticate, controller.generateVirtualAccount); 
router.route('/verify_transaction/:transaction_ref').get(authenticate, controller.verifyTransaction); 
router.route('/wallet_balance').get(authenticate, controller.userBalance); 
router.route('/create_transaction').post(authenticate, controller.createTrtansaction); 


//BILLS
router.route('/bills/check_meter').post(authenticate, controller.checkMeter); 
router.route('/bills/discos').get(authenticate, controller.checkDisco); 
router.route('/bills/price_list').post(authenticate, controller.priceList); 
router.route('/bills/create_order').post(authenticate, valiVends, controller.purchaseBill); 


export default router