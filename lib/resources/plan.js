var requestManager = require('../request-manager');
var planModel = require('../models/planModel');
var collectionsModule = require('./collections');
var preConditions = require('../precondition');

var plan = module.exports = {
  schema: planModel,
  idempotency: true
};

plan.create = requestManager.describe({
  path: '/v1/plans',
  method: 'POST'
});

plan.save = plan.create;

plan.update = requestManager.describe({
  path: '/v1/plans/:id',
  method: 'PUT'
});

plan.get = requestManager.describe({
  path: '/v1/plans/:id',
  method: 'GET'
});

plan.findById = plan.get;