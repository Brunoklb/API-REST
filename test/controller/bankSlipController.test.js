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
  let createStub, getOneStub, getAllStub, removeStub, updateStub;

  beforeEach(() => {
    createStub = sinon.stub(bankSlipRepository, 'create');
    getOneStub = sinon.stub(bankSlipRepository, 'getOne');
    getAllStub = sinon.stub(bankSlipRepository, 'getAll');
    removeStub = sinon.stub(bankSlipRepository, 'remove');
    updateStub = sinon.stub(bankSlipRepository, 'update');
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
      expect(next.args[0][0].status).to.equal(500);
    });
  });

  describe('cancelBankSlipById()', () => {
    it('should cancel a pending bank slip and return it', async () => {
      const req = {
        params: {
          id: 'valid-id'
        }
      };
      const res = {
        json: sinon.stub(),
      };
  
      const next = sinon.stub();
  
      const bankSlip = {
        id: 'valid-id',
        status: 'PENDING'
      };
  
      getOneStub.returns(bankSlip);
      updateStub.returns({ ...bankSlip, status: 'CANCELED' });
  
      await bankSlipController.cancelBankSlipById(req, res, next);
  
      expect(res.json.calledWith({ ...bankSlip, status: 'CANCELED' })).to.be.true;
      expect(next.called).to.be.false;
    });
  
    it('should respond with 422 when bank slip is not pending', async () => {
      const req = {
        params: {
          id: 'valid-id'
        }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
  
      const next = sinon.stub();
  
      const bankSlip = {
        id: 'valid-id',
        status: 'PAID'
      };
  
      getOneStub.returns(bankSlip);
  
      await bankSlipController.cancelBankSlipById(req, res, next);
  
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('Cannot cancel bank slip that is not in pending status');
      expect(next.args[0][0].status).to.equal(422);
    });
  
    it('should respond with 404 when bank slip does not exist', async () => {
      const req = {
        params: {
          id: 'non-existent-id'
        }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
  
      const next = sinon.stub();
  
      getOneStub.returns(null);
  
      await bankSlipController.cancelBankSlipById(req, res, next);
  
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('Bank slip not found');
      expect(next.args[0][0].status).to.equal(404);
    });
  });
  
});
