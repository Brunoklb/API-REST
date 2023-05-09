const router = require('express').Router();

const bankSlipController = require('../controllers/BankSlipController');

router.get('/rest/bankslips', bankSlipController.getAllBankSlips);
router.get('/rest/bankslips/:id', bankSlipController.getBankSlipById);

module.exports = router;