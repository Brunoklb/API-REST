const router = require('express').Router();

const bankSlipController = require('../controllers/BankSlipController');

router.post('/rest/bankslips', bankSlipController.createBankSlip);
router.get('/rest/bankslips', bankSlipController.getAllBankSlips);
router.get('/rest/bankslips/:id', bankSlipController.getBankSlipById);
router.delete('/rest/bankslips/:id', bankSlipController.deleteBankSlipById);
router.post('/rest/bankslips/:id/payments', bankSlipController.payBankSlip);
router.put('/rest/bankslips/:id', bankSlipController.cancelBankSlipById);

module.exports = router;