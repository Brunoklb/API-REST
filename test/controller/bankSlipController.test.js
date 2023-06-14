/* eslint-disable no-unused-vars */
/* eslint-disable indent */
/* eslint-disable no-undef */

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { expect } = chai;
const bankSlipController = require('../../src/controllers/BankSlipController');
const bankSlipRepository = require('../../src/db/bankSlipRepository');

describe('Bank Slip Controller', () => {
  beforeEach(() => {
    stub = sinon.stub;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createBankSlip()', () => {
    it('Should create a bank slip', async () => {
      const req = {
        body: {
          due_date: '2023-06-02',
          total_in_cents: 10000,
          customer: 'John Doe',
        },
      };
      const res = {
        status: stub().returnsThis(),
        json: stub(),
      };

      const createStub = sinon.stub(bankSlipRepository, 'create').resolves('123456');
      await bankSlipController.createBankSlip(req, res);

      expect(createStub.calledOnce).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith({ id: '123456', ...req.body })).to.be.true;
    });
  });
});
