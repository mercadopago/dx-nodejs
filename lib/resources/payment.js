var requestManager = require('../request-manager');
var paymentModel = require('../models/paymentModel');
var collectionsModule = require('./collections');
var preConditions = require('../precondition');

var payment = module.exports = {
  schema: paymentModel,
  idempotency: true
};

payment.create = requestManager.describe({
  path: '/v1/payments',
  method: 'POST'
});

payment.save = payment.create;

payment.update = requestManager.describe({
  path: '/v1/payments/:id',
  method: 'PUT'
});

payment.get = requestManager.describe({
  path: '/v1/payments/:id',
  method: 'GET'
});

payment.findById = payment.get;

payment.search = requestManager.describe({
  path: '/v1/payments/search',
  method: 'GET'
});

payment.methods = requestManager.describe({
  path: '/v1/payment_methods',
  method: 'GET'
});

payment.issuers = requestManager.describe({
  path: '/v1/payment_methods/card_issuers?payment_method_id=:id&bin=:bin',
  method: 'GET'
});

/**
 * Search payment: Use v0 -> /collections
 */
payment.oldSearch = collectionsModule.search;

/**
 * Cancel payment: Use v0 -> /collections
 * @param id
 * @param callback
 * @returns {*}
 */
payment.cancel = function (id, callback) {
  var paymentId = (typeof arguments[0] === 'object') ? arguments[0].id : arguments[0];

  callback = preConditions.getCallback(callback);

  return collectionsModule.put({
    id: paymentId,
    status: 'cancelled'
  }, callback);
};

/**
 * Refund payment: Use v0 -> /collections
 * @param id
 * @param callback
 * @returns {*}
 */
payment.refund = function (id, callback) {
  var paymentId = (typeof arguments[0] === 'object') ? arguments[0].id : arguments[0];

  callback = preConditions.getCallback(callback);

  return collectionsModule.put({
    id: paymentId,
    status: 'refunded'
  }, callback);
};

/**
 * Refund partial payment: Use v0 -> /collections
 * @param refund
 * @param callback
 * @returns {Thenable.<U>|*|{anyOf}|*}
 */
payment.refundPartial = function (refund, callback) {
  callback = preConditions.getCallback(callback);

  return collectionsModule.refunds.post(refund, callback);
};
