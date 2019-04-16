var requestManager = require('../request-manager');
var subscriptionModel = require('../models/subscriptionModel');
var collectionsModule = require('./collections');
var preConditions = require('../precondition');

var subscription = module.exports = {
  schema: subscriptionModel,
  idempotency: true
};

subscription.create = requestManager.describe({
  path: '/v1/subscriptions',
  method: 'POST'
});

subscription.save = subscription.create;

subscription.update = requestManager.describe({
  path: '/v1/subscriptions/:id',
  method: 'PUT'
});

subscription.get = requestManager.describe({
  path: '/v1/subscriptions/:id',
  method: 'GET'
});

subscription.findById = subscription.get;