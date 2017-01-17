var chai = require('chai'),
    sinon = require('sinon'),
    chaiAsPromised = require("chai-as-promised"),
    Promise = require('bluebird');

chai.use(chaiAsPromised);

var assert = chai.assert,
    expect = chai.expect;

describe('Mercadopago Support (Backward Compatibility)', function(){
    var mp = require('../index.js'),
        requestLib = require('request'),
        requestManager = require('../lib/request-manager'),
        paymentModule = require('../lib/resources/payment'),
        preferencesModule = require('../lib/resources/prefereces'),
        preapprovalModule = require('../lib/resources/preapproval'),
        ipnModule = require('../lib/resources/ipn'),
        requestStub;

    var mpResponse = {
        firstname: 'Ariel'
    };

    it('Show Warning', function(){
        var originalEnv = process.env.NODE_ENV;

        process.env.NODE_ENV = 'PRD';

        var stub = sinon.stub(console, 'warn', function(){ /* Do Nothing */});

        mp.sandboxMode(true);

        assert.isTrue(stub.called);

        stub.restore();

        process.env.NODE_ENV = originalEnv;
    });

    it('Dont show Warning', function(){
        var stub = sinon.stub(console, 'warn', function(){ /* Do Nothing */});

        mp.sandboxMode(true);

        assert.isFalse(stub.called);

        stub.restore();
    });

    describe('Methods without warning', function(){
        beforeEach(function(){
            requestStub = sinon.stub(requestLib, 'Request', function(params){
                return params.callback.apply(null, [null, {
                    statusCode: 200
                }, mpResponse]);
            });
        });

        afterEach(function(){
            requestStub.restore();
        });

        it('SandboxMode', function(){
            mp.sandboxMode(true);

            assert.isTrue(mp.configurations.sandbox);

            mp.sandboxMode();

            assert.isTrue(mp.configurations.sandbox);

            mp.sandboxMode(false);

            assert.isFalse(mp.configurations.sandbox);
        });

        it('getAccessToken', function(){
            var stub = sinon.stub(requestManager, 'generateAccessToken', function(callback){
                return new Promise(function(resolve, reject){
                    resolve('ACCESS_TOKEN');
                    return callback.apply(null, [null, 'ACCESS_TOKEN']);;
                });
            });

            var callback = sinon.spy();

            var promise = mp.getAccessToken(callback);

            assert.isFulfilled(promise, 'ACCESS_TOKEN');

            promise.then(function(){
                assert.isTrue(callback.called);
            });

            stub.restore();
        });

        describe('REST Methods', function(){
            var accessToken = 'ACCESS_TOKEN',
                generateTokenStub;

            describe('Valid Operations', function(){
                before(function(){
                    generateTokenStub = sinon.stub(requestManager, 'generateAccessToken', function(callback){
                        return new Promise(function(resolve, reject){
                            resolve(accessToken);
                            return callback.apply(null, [null, accessToken]);
                        });
                    });
                });

                after(function(){
                    generateTokenStub.restore();
                });

                it('get', function(){
                    var promise = mp.get('/v1/payments/1', {
                        test_paremeter: 'get'
                    });

                    assert.isFulfilled(promise);

                    promise.then(function(){
                        var requestArgs = requestStub.args[0][0];

                        assert.isTrue(requestStub.called);
                        assert.equal(requestArgs.uri, mp.configurations.getBaseUrl() + '/v1/payments/1');
                        assert.equal(requestArgs.method, 'GET');
                        assert.equal(requestArgs.qs.test_paremeter, 'get');
                    });

                    //With Callback
                    var callback = sinon.spy();

                    var promiseCallback = mp.get('/v1/payments/1', callback);

                    assert.isFulfilled(promiseCallback);

                    promiseCallback.then(function(){
                        assert.isTrue(callback.called);
                    });
                });

                it('post', function(){
                    var promise = mp.post('/v1/payments', {
                        payload: true
                    },{
                        test_paremeter: 'post'
                    });

                    assert.isFulfilled(promise);

                    promise.then(function(){
                        var requestArgs = requestStub.args[0][0];

                        assert.isTrue(requestStub.called);
                        assert.equal(requestArgs.uri, mp.configurations.getBaseUrl() + '/v1/payments');
                        assert.equal(requestArgs.method, 'POST');
                        assert.isTrue(requestArgs.json.payload);
                        assert.equal(requestArgs.qs.test_paremeter, 'post');
                    });

                    var callback = sinon.spy();

                    var promiseCallback = mp.post('/v1/payments', callback);

                    assert.isFulfilled(promiseCallback);

                    promiseCallback.then(function(){
                        assert.isTrue(callback.called);
                    });
                });

                it('put', function(){
                    var promise = mp.put('/v1/payments', {
                        payload: true
                    },{
                        test_paremeter: 'put'
                    });

                    assert.isFulfilled(promise);

                    promise.then(function(){
                        var requestArgs = requestStub.args[0][0];

                        assert.isTrue(requestStub.called);
                        assert.equal(requestArgs.uri, mp.configurations.getBaseUrl() + '/v1/payments');
                        assert.equal(requestArgs.method, 'PUT');
                        assert.isTrue(requestArgs.json.payload);
                        assert.equal(requestArgs.qs.test_paremeter, 'put');
                    });

                    var callback = sinon.spy();

                    var promiseCallback = mp.put('/v1/payments', callback);

                    assert.isFulfilled(promiseCallback);

                    promiseCallback.then(function(){
                        assert.isTrue(callback.called);
                    });
                });

                it('delete', function(){
                    var promise = mp.delete('/v1/payments/1', {
                        test_paremeter: 'delete'
                    });

                    assert.isFulfilled(promise);

                    promise.then(function(){
                        var requestArgs = requestStub.args[0][0];

                        assert.isTrue(requestStub.called);
                        assert.equal(requestArgs.uri, mp.configurations.getBaseUrl() + '/v1/payments/1');
                        assert.equal(requestArgs.method, 'DELETE');
                        assert.equal(requestArgs.qs.test_paremeter, 'delete');
                    });

                    var callback = sinon.spy();

                    var promiseCallback = mp.delete('/v1/payments/1', callback);

                    assert.isFulfilled(promiseCallback);

                    promiseCallback.then(function(){
                        assert.isTrue(callback.called);
                    });
                });
            });

            describe('Invalid Operations', function(){
                var errorMessage = 'An Error Ocurred';

                before(function(){
                    generateTokenStub = sinon.stub(requestManager, 'generateAccessToken', function(callback){
                        return new Promise(function(resolve, reject){
                            reject(new Error(errorMessage));
                            return callback.apply(null, [new Error(errorMessage), null]);
                        });
                    });
                });

                after(function(){
                    generateTokenStub.restore();
                });

                it('get', function(){
                    var promise = mp.get('/v1/payments/1', {
                        test_paremeter: 'get'
                    });

                    assert.isRejected(promise, errorMessage);

                    //With Callback
                    var callback = sinon.spy();

                    var promiseCallback = mp.get('/v1/payments/1', callback);

                    assert.isRejected(promiseCallback, errorMessage);

                    promiseCallback.catch(function(){
                        var error = callback.args[0][0];

                        assert.isTrue(callback.called);
                        assert.equal(error.message, errorMessage);
                    });
                });

                it('post', function(){
                    var promise = mp.post('/v1/payments', {
                        payload: true
                    },{
                        test_paremeter: 'post'
                    });

                    assert.isRejected(promise, errorMessage);

                    var callback = sinon.spy();

                    var promiseCallback = mp.post('/v1/payments', callback);

                    assert.isRejected(promiseCallback, errorMessage);

                    promiseCallback.catch(function(){
                        var error = callback.args[0][0];

                        assert.isTrue(callback.called);
                        assert.equal(error.message, errorMessage);
                    });
                });

                it('put', function(){
                    var promise = mp.put('/v1/payments', {
                        payload: true
                    },{
                        test_paremeter: 'put'
                    });

                    assert.isRejected(promise, errorMessage);

                    var callback = sinon.spy();

                    var promiseCallback = mp.put('/v1/payments', callback);

                    assert.isRejected(promiseCallback, errorMessage);

                    promiseCallback.catch(function(){
                        var error = callback.args[0][0];

                        assert.isTrue(callback.called);
                        assert.equal(error.message, errorMessage);
                    });
                });

                it('delete', function(){
                    var promise = mp.delete('/v1/payments/1', {
                        test_paremeter: 'delete'
                    });

                    assert.isRejected(promise, errorMessage);

                    var callback = sinon.spy();

                    var promiseCallback = mp.delete('/v1/payments/1', callback);

                    assert.isRejected(promiseCallback, errorMessage);

                    promiseCallback.catch(function(){
                        var error = callback.args[0][0];

                        assert.isTrue(callback.called);
                        assert.equal(error.message, errorMessage);
                    });
                });
            });
        });

        it('createPreference', function(){
            var stub = sinon.stub(preferencesModule, 'create', function(){});

            mp.createPreference({ test: true });

            assert.isTrue(stub.called);
            assert.isTrue(stub.calledWith({ test: true }, undefined));

            stub.restore();
        });

        it('updatePreference', function(){
            var stub = sinon.stub(preferencesModule, 'update', function(){});

            mp.updatePreference(1, {});

            assert.isTrue(stub.called);
            assert.isTrue(stub.calledWith({ id: 1 }));

            stub.restore();
        });

        it('getPreference', function(){
            var stub = sinon.stub(preferencesModule, 'get', function(){});

            mp.getPreference(1);

            assert.isTrue(stub.called);
            assert.isTrue(stub.calledWith(1, undefined));

            stub.restore();
        });

        it('createPreapprovalPayment', function(){
            var stub = sinon.stub(preapprovalModule, 'create', function(){});

            mp.createPreapprovalPayment({ id: 1 });

            assert.isTrue(stub.called);
            assert.isTrue(stub.calledWith({ id: 1 }, undefined));

            stub.restore();
        });

        it('updatePreapprovalPayment', function(){
            var stub = sinon.stub(preapprovalModule, 'update', function(){});

            mp.updatePreapprovalPayment(1, {});

            assert.isTrue(stub.called);
            assert.isTrue(stub.calledWith({ id: 1 }));

            stub.restore();
        });

        it('getPreapprovalPayment', function(){
            var stub = sinon.stub(preapprovalModule, 'get', function(){});

            mp.getPreapprovalPayment(1);

            assert.isTrue(stub.called);
            assert.isTrue(stub.calledWith(1, undefined));

            stub.restore();
        });

        it('searchPayment', function(){
            var stub = sinon.stub(paymentModule, 'search', function(){});

            mp.searchPayment({ fields: 'firstname' }, 0, 10);

            assert.isTrue(stub.called);
            assert.isTrue(stub.calledWith({ qs: { fields: 'firstname', offset: 0, limit: 10 } }));

            mp.searchPayment({ fields: 'firstname' });

            assert.isTrue(stub.called);
            assert.isTrue(stub.calledWith({ qs: { fields: 'firstname' } }));

            stub.restore();
        });

        it('getPayment', function(){
            var stub = sinon.stub(ipnModule, 'getPayment', function(){});

            mp.getPayment(1);

            assert.isTrue(stub.called);
            assert.isTrue(stub.calledWith(1, undefined));

            stub.restore();
        });

        it('getAuthorizedPayment', function(){
            var stub = sinon.stub(ipnModule, 'getAuthorizedPayment', function(){});

            mp.getAuthorizedPayment(1);

            assert.isTrue(stub.called);
            assert.isTrue(stub.calledWith(1, undefined));

            stub.restore();
        });

        it('refundPayment', function(){
            var stub = sinon.stub(requestManager, 'generateAccessToken', function(){
                return new Promise(function(resolve, reject){
                    resolve('ACCESS_TOKEN');
                });
            });

            var promise = mp.refundPayment(1);

            assert.isFulfilled(promise);

            promise.then(function(){
                assert.isTrue(requestStub.called);

                var requestArgs = requestStub.args[0][0];

                assert.equal(requestArgs.uri, mp.configurations.getBaseUrl() + '/v1/collections/1');
                assert.equal(requestArgs.method, 'PUT');
                assert.equal(requestArgs.json.id, 1);
                assert.equal(requestArgs.json.status, 'refunded');
            });

            stub.restore();
        });

        it('cancelPayment', function(){
            var accessToken = 'ACCESS_TOKEN';

            var stub = sinon.stub(requestManager, 'generateAccessToken', function(callback){
                return new Promise(function(resolve, reject){
                    resolve(accessToken);
                    callback.apply(null, [null, accessToken]);
                });
            });

            var promise = mp.cancelPayment(1);

            assert.isFulfilled(promise);

            promise.then(function(){
                assert.isTrue(requestStub.called);

                var requestArgs = requestStub.args[0][0];

                assert.equal(requestArgs.uri, mp.configurations.getBaseUrl() + '/v1/collections/1');
                assert.equal(requestArgs.method, 'PUT');
                assert.equal(requestArgs.json.id, 1);
                assert.equal(requestArgs.json.status, 'cancelled');
            });

            stub.restore();
        });

        it('cancelPreapprovalPayment', function(){
            var stub = sinon.stub(preapprovalModule, 'update', function(){});

            mp.cancelPreapprovalPayment(1);

            assert.isTrue(stub.called);
            assert.isTrue(stub.calledWith({ id: 1, status: "cancelled" }, undefined));

            stub.restore();
        });
    });
});