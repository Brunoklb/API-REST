const router = require('express').Router();
const bankSlipController = require('../controllers/BankSlipController');
const protectRoute = require('../middlewares/jwt');

router.post('/rest/bankslips', protectRoute, bankSlipController.createBankSlip);
router.get('/rest/bankslips', protectRoute, bankSlipController.getAllBankSlips);
router.get('/rest/bankslips/:id', protectRoute, bankSlipController.getBankSlipById);
router.delete('/rest/bankslips/:id', protectRoute, bankSlipController.deleteBankSlipById);
router.post('/rest/bankslips/:id/payments', protectRoute, bankSlipController.payBankSlip);
router.put('/rest/bankslips/:id', protectRoute, bankSlipController.cancelBankSlipById);
router.get('/rest/bankslips', protectRoute, bankSlipController.getBankSlipOr404);

module.exports = router;