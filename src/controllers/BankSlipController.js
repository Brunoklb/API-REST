const { getOne, getAll } = require('../db/BankSlipRepository');

async function getBankSlipById(req, res) {
    const { id } = req.params;

    try {
        const bankSlip = await getOne(id);
        if (!bankSlip) {
            return res.status(404).json({ message: 'Bank slip not found' });
        }
        res.json(bankSlip);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving bank slip' });
    }
}

async function getAllBankSlips(req, res) {
    try {
        const bankSlips = await getAll();
        res.json(bankSlips);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving bank slips' });
    }
}

module.exports = { getAllBankSlips, getBankSlipById };