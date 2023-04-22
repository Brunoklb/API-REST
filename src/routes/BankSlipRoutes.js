const router = require('express').Router()

const bankSlipController = require('../controllers/BankSlipController')

router.get('/bankslip', bankSlipController.getAllBankSlips)
router.get('/bankslip/:id', bankSlipController.getBankSlipById)

module.exports = router