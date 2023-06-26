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
  let createStub;
  beforeEach(() => {
    createStub = sinon.stub(bankSlipRepository, 'create');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createBankSlip()', () => {
    it('Should respond with 422 when bank slip is not provided in request body', async () => {
      const req = {
        body: {},
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      const next = sinon.stub();

      await bankSlipController.createBankSlip(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('Bank slip not provided in the request body');
      expect(next.args[0][0].status).to.equal(422);
    });

    it('Should respond with 422 when bank slip creation fails', async () => {
      const req = {
        body: {
          due_date: '2023-06-02',
          total_in_cents: 10000,
          customer: 'John Doe',
        },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      const next = sinon.stub();

      createStub.rejects(new Error('Invalid bank slip provided'));

      await bankSlipController.createBankSlip(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('Invalid bank slip provided');
      expect(next.args[0][0].status).to.equal(422);
    });
  });
});
