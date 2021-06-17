/* eslint-env node, mocha */
var chai = require('chai');
var sinon = require('sinon');
var chaiAsPromised = require('chai-as-promised');
var Promise = require('bluebird');
var assert = chai.assert;
var mp = require('../index.js');
var requestLib = require('request');
var requestManager = require('../lib/request-manager');
var paymentModule = require('../lib/resources/payment');
var preferencesModule = require('../lib/resources/preferences');
var preapprovalModule = require('../lib/resources/preapproval');
var ipnModule = require('../lib/resources/ipn');

chai.use(chaiAsPromised);

describe('Mercadopago Support (Backward Compatibility)', function () {
  var requestStub;
  var mpResponse = {
    firstname: 'Ariel'
  };

  it('Show Warning', function () {
    var stub = sinon.stub(console, 'warn', function () { /* Do Nothing */ });
    var originalEnv = process.env.NODE_ENV;

    process.env.NODE_ENV = 'PRD';

    mp.sandboxMode(true);

    assert.isTrue(stub.called);

    stub.restore();

    process.env.NODE_ENV = originalEnv;
  });

  it('Dont show Warning', function () {
    var stub = sinon.stub(console, 'warn', function () { /* Do Nothing */ });

    mp.sandboxMode(true);

    assert.isFalse(stub.called);

    stub.restore();
  });

  describe('Methods without warning', function () {
    beforeEach(function () {
      requestStub = sinon.stub(requestLib, 'Request', function (params) {
        return params.callback.apply(null, [null, {
          statusCode: 200
        }, mpResponse]);
      });
    });

    afterEach(function () {
      requestStub.restore();
    });

    it('SandboxMode', function () {
      mp.sandboxMode(true);

      assert.isTrue(mp.configurations.sandbox);

      mp.sandboxMode();

      assert.isTrue(mp.configurations.sandbox);

      mp.sandboxMode(false);

      assert.isFalse(mp.configurations.sandbox);
    });

    it('getAccessToken', function (done) {
      var stub = sinon.stub(requestManager, 'generateAccessToken', function(callback){
        return new Promise(function(resolve) {
          resolve('ACCESS_TOKEN');
          return callback.apply(null, [null, 'ACCESS_TOKEN']);
        });
      });

      var callback = sinon.spy();
      var promise = mp.getAccessToken(callback);

      assert.isFulfilled(promise, 'ACCESS_TOKEN');

      promise.then(function () {
        assert.isTrue(callback.called);
        stub.restore();
        done();
      });
    });

    describe('REST Methods', function () {
      var accessToken = 'ACCESS_TOKEN';
      var generateTokenStub;

      describe('Valid Operations', function () {
        before(function () {
          generateTokenStub = sinon.stub(requestManager, 'generateAccessToken', function (callback) {
            return new Promise(function (resolve) {
              resolve(accessToken);
              return callback.apply(null, [null, accessToken]);
            });
          });
        });

        after(function () {
          generateTokenStub.restore();
        });

        it('get - promise', function (done) {
          var promise = mp.get('/v1/payments/1', {
            test_paremeter: 'get'
          });

          assert.isFulfilled(promise);

          promise.then(function (response) {
            var requestArgs = requestStub.args[0][0];

            assert.isTrue(requestStub.called);
            assert.equal(requestArgs.uri, mp.configurations.getBaseUrl() + '/v1/payments/1');
            assert.equal(requestArgs.method, 'GET');
            assert.equal(requestArgs.qs.test_paremeter, 'get');

            // Check response
            assert.equal(response.body.firstname, mpResponse.firstname);

            done();
          }).catch(function (err) {
            done(err);
          });
        });

        it('get - callback', function (done) {
          var callback = sinon.spy();

          var promise = mp.get('/v1/payments/1', {
            test_paremeter: 'get'
          }, callback);

          promise.then(function () {
            var requestArgs = requestStub.args[0][0];

            assert.isTrue(callback.called);

            assert.isTrue(requestStub.called);
            assert.equal(requestArgs.uri, mp.configurations.getBaseUrl() + '/v1/payments/1');
            assert.equal(requestArgs.method, 'GET');
            assert.equal(requestArgs.qs.test_paremeter, 'get');

            done();
          });
        });

        it('post - promise', function (done) {
          var promise = mp.post('/v1/payments', {
            payload: true
          }, {
            test_paremeter: 'post'
          });

          assert.isFulfilled(promise);

          promise.then(function () {
            var requestArgs = requestStub.args[0][0];

            assert.isTrue(requestStub.called);
            assert.equal(requestArgs.uri, mp.configurations.getBaseUrl() + '/v1/payments');
            assert.equal(requestArgs.method, 'POST');
            assert.isTrue(requestArgs.json.payload);
            assert.equal(requestArgs.qs.test_paremeter, 'post');

            done();
          }).catch(function (err) {
            done(err);
          });
        });

        it('post - callback', function (done) {
          var callback = sinon.spy();

          var promise = mp.post('/v1/payments', {
            payload: true
          }, {
            test_paremeter: 'post'
          }, callback);

          promise.then(function () {
            var requestArgs = requestStub.args[0][0];

            assert.isTrue(callback.called);

            assert.isTrue(requestStub.called);
            assert.equal(requestArgs.uri, mp.configurations.getBaseUrl() + '/v1/payments');
            assert.equal(requestArgs.method, 'POST');
            assert.equal(requestArgs.qs.test_paremeter, 'post');

            done();
          });
        });

        it('put - promise', function (done) {
          var promise = mp.put('/v1/payments', {
            payload: true
          }, {
            test_paremeter: 'put'
          });

          assert.isFulfilled(promise);

          promise.then(function () {
            var requestArgs = requestStub.args[0][0];

            assert.isTrue(requestStub.called);
            assert.equal(requestArgs.uri, mp.configurations.getBaseUrl() + '/v1/payments');
            assert.equal(requestArgs.method, 'PUT');
            assert.isTrue(requestArgs.json.payload);
            assert.equal(requestArgs.qs.test_paremeter, 'put');

            done();
          }).catch(function (err) {
            done(err);
          });
        });

        it('put - callback', function (done) {
          var callback = sinon.spy();

          var promise = mp.put('/v1/payments', {
            payload: true
          }, {
            test_paremeter: 'put'
          }, callback);

          promise.then(function () {
            var requestArgs = requestStub.args[0][0];

            assert.isTrue(callback.called);

            assert.isTrue(requestStub.called);
            assert.equal(requestArgs.uri, mp.configurations.getBaseUrl() + '/v1/payments');
            assert.equal(requestArgs.method, 'PUT');
            assert.equal(requestArgs.qs.test_paremeter, 'put');

            done();
          });
        });

        it('delete - promise', function (done) {
          var promise = mp.delete('/v1/payments/1', {
            test_paremeter: 'delete'
          });

          assert.isFulfilled(promise);

          promise.then(function () {
            var requestArgs = requestStub.args[0][0];

            assert.isTrue(requestStub.called);
            assert.equal(requestArgs.uri, mp.configurations.getBaseUrl() + '/v1/payments/1');
            assert.equal(requestArgs.method, 'DELETE');
            assert.equal(requestArgs.qs.test_paremeter, 'delete');

            done();
          }).catch(function (err) {
            done(err);
          });
        });

        it('delete - callback', function (done) {
          var callback = sinon.spy();

          var promise = mp.delete('/v1/payments/1', {
            test_paremeter: 'delete'
          }, callback);

          promise.then(function () {
            var requestArgs = requestStub.args[0][0];

            assert.isTrue(callback.called);

            assert.isTrue(requestStub.called);
            assert.equal(requestArgs.uri, mp.configurations.getBaseUrl() + '/v1/payments/1');
            assert.equal(requestArgs.method, 'DELETE');
            assert.equal(requestArgs.qs.test_paremeter, 'delete');

            done();
          });
        });
      });

      describe('Invalid Operations', function () {
        var errorMessage = 'An Error Ocurred';

        before(function () {
          generateTokenStub = sinon.stub(requestManager, 'generateAccessToken', function (callback) {
            return new Promise(function (resolve, reject) {
              reject(new Error(errorMessage));
              return callback.apply(null, [new Error(errorMessage), null]);
            });
          });
        });

        after(function () {
          generateTokenStub.restore();
        });

        it('get - promise', function (done) {
          var promise = mp.get('/v1/payments/1', {
            test_paremeter: 'get'
          });

          promise.catch(function () {
            assert.isRejected(promise, errorMessage);

            done();
          });
        });

        it('get - callback', function (done) {
          var callback = sinon.spy();

          var promise = mp.get('/v1/payments/1', {
            test_paremeter: 'get'
          }, callback);

          promise.catch(function () {
            var error = callback.args[0][0];

            assert.isTrue(callback.called);
            assert.equal(error.message, errorMessage);

            done();
          });
        });

        it('post - promise', function (done) {
          var promise = mp.post('/v1/payments', {
            payload: true
          }, {
            test_paremeter: 'post'
          });

          assert.isRejected(promise, errorMessage);

          promise.catch(function () {
            assert.isRejected(promise, errorMessage);

            done();
          });
        });

        it('post - callback', function (done) {
          var callback = sinon.spy();

          var promise = mp.post('/v1/payments', {
            payload: true
          }, {
            test_paremeter: 'post'
          }, callback);

          promise.catch(function () {
            var error = callback.args[0][0];

            assert.isTrue(callback.called);
            assert.equal(error.message, errorMessage);

            done();
          });
        });

        it('put - promise', function (done) {
          var promise = mp.put('/v1/payments', {
            payload: true
          }, {
            test_paremeter: 'put'
          });

          promise.catch(function () {
            assert.isRejected(promise, errorMessage);

            done();
          });
        });

        it('put - callback', function (done) {
          var callback = sinon.spy();

          var promise = mp.put('/v1/payments', {
            payload: true
          }, {
            test_paremeter: 'put'
          }, callback);

          promise.catch(function () {
            var error = callback.args[0][0];

            assert.isTrue(callback.called);
            assert.equal(error.message, errorMessage);

            done();
          });
        });

        it('delete - promise', function (done) {
          var promise = mp.delete('/v1/payments/1', {
            test_paremeter: 'delete'
          });

          promise.catch(function () {
            assert.isRejected(promise, errorMessage);

            done();
          });
        });

        it('delete - callback', function (done) {
          var callback = sinon.spy();

          var promise = mp.delete('/v1/payments/1', {
            test_paremeter: 'delete'
          }, callback);

          promise.catch(function () {
            var error = callback.args[0][0];

            assert.isTrue(callback.called);
            assert.equal(error.message, errorMessage);

            done();
          });
        });
      });
    });

    it('createPreference', function () {
      var stub = sinon.stub(preferencesModule, 'create', function () {});
      var stubArguments;

      mp.createPreference({
        test: true
      });

      stubArguments = stub.args[0][0];

      assert.isTrue(stub.called);
      assert.equal(JSON.stringify(stubArguments), JSON.stringify({test: true}));

      stub.restore();
    });

    it('updatePreference', function () {
      var stub = sinon.stub(preferencesModule, 'update', function () {});
      var stubArguments;

      mp.updatePreference(1, {});

      stubArguments = stub.args[0][0];

      assert.isTrue(stub.called);
      assert.equal(JSON.stringify(stubArguments), JSON.stringify({ id: 1 }));

      stub.restore();
    });

    it('getPreference', function () {
      var stub = sinon.stub(preferencesModule, 'get', function () {});
      var stubArguments;

      mp.getPreference(1);

      stubArguments = stub.args[0][0];

      assert.isTrue(stub.called);
      assert.equal(stubArguments, 1);

      stub.restore();
    });

    it('createPreapprovalPayment', function () {
      var stub = sinon.stub(preapprovalModule, 'create', function () {});
      var stubArguments;

      mp.createPreapprovalPayment({
        id: 1
      });

      stubArguments = stub.args[0][0];

      assert.isTrue(stub.called);
      assert.equal(JSON.stringify(stubArguments), JSON.stringify({ id: 1 }));

      stub.restore();
    });

    it('updatePreapprovalPayment', function () {
      var stub = sinon.stub(preapprovalModule, 'update', function () {});
      var stubArguments;

      mp.updatePreapprovalPayment(1, {});

      stubArguments = stub.args[0][0];

      assert.isTrue(stub.called);
      assert.equal(JSON.stringify(stubArguments), JSON.stringify({ id: 1 }));

      stub.restore();
    });

    it('getPreapprovalPayment', function () {
      var stub = sinon.stub(preapprovalModule, 'get', function () {});
      var stubArguments;

      mp.getPreapprovalPayment(1);

      stubArguments = stub.args[0][0];

      assert.isTrue(stub.called);
      assert.equal(stubArguments, 1);

      stub.restore();
    });

    it('searchPayment', function () {
      var stub = sinon.stub(paymentModule, 'oldSearch', function () {});
      var stubArguments;

      mp.searchPayment({
        fields: 'firstname'
      }, 0, 10);

      stubArguments = stub.args[0][0];

      assert.isTrue(stub.called);
      assert.equal(JSON.stringify(stubArguments), JSON.stringify({
        qs: {
          fields: 'firstname', offset: 0, limit: 10
        }
      }));

      mp.searchPayment({
        fields: 'firstname'
      });

      stub.restore();
    });

    it('searchPayment - no offset and limit', function () {
      var stub = sinon.stub(paymentModule, 'oldSearch', function () {});
      var stubArguments;

      mp.searchPayment({
        fields: 'firstname'
      });

      assert.isTrue(stub.called);

      stubArguments = stub.args[0][0];

      assert.equal(JSON.stringify(stubArguments), JSON.stringify({
        qs: {
          fields: 'firstname'
        }
      }));

      stub.restore();
    });

    it('getPayment', function () {
      var stub = sinon.stub(ipnModule, 'getPayment', function () {});
      var stubArguments;

      mp.getPayment(1);

      stubArguments = stub.args[0][0];

      assert.isTrue(stub.called);
      assert.equal(stubArguments, 1);

      stub.restore();
    });

    it('getAuthorizedPayment', function () {
      var stub = sinon.stub(ipnModule, 'getAuthorizedPayment', function () {});
      var stubArguments;

      mp.getAuthorizedPayment(1);

      stubArguments = stub.args[0][0];

      assert.isTrue(stub.called);
      assert.equal(stubArguments, 1);

      stub.restore();
    });

    it('refundPayment', function () {
      var requestArgs;

      var stub = sinon.stub(requestManager, 'generateAccessToken', function () {
        return new Promise(function (resolve) {
          resolve('ACCESS_TOKEN');
        });
      });

      var promise = mp.refundPayment(1);

      assert.isFulfilled(promise);

      promise.then(function () {
        assert.isTrue(requestStub.called);

        requestArgs = requestStub.args[0][0];

        assert.equal(requestArgs.uri, mp.configurations.getBaseUrl() + '/collections/1');
        assert.equal(requestArgs.method, 'PUT');
        assert.equal(requestArgs.json.status, 'refunded');
      });

      stub.restore();
    });

    it('cancelPayment', function () {
      var requestArgs;
      var accessToken = 'ACCESS_TOKEN';

      var stub = sinon.stub(requestManager, 'generateAccessToken', function (callback) {
        return new Promise(function (resolve) {
          resolve(accessToken);
          callback.apply(null, [null, accessToken]);
        });
      });

      var promise = mp.cancelPayment(1);

      assert.isFulfilled(promise);

      promise.then(function () {
        assert.isTrue(requestStub.called);

        requestArgs = requestStub.args[0][0];

        assert.equal(requestArgs.uri, mp.configurations.getBaseUrl() + '/collections/1');
        assert.equal(requestArgs.method, 'PUT');
        assert.equal(requestArgs.json.status, 'cancelled');
      });

      stub.restore();
    });

    it('cancelPreapprovalPayment', function () {
      var stub = sinon.stub(preapprovalModule, 'update', function () {});
      var stubArguments;

      mp.cancelPreapprovalPayment(1);

      stubArguments = stub.args[0][0];

      assert.isTrue(stub.called);
      assert.equal(JSON.stringify(stubArguments), JSON.stringify({
        id: 1, status: 'cancelled'
      }));

      stub.restore();
    });
  });
});
