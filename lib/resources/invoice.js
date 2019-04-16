var requestManager = require('../request-manager');
var invoiceModel = require('../models/invoiceModel');

var invoice = module.exports = {
  schema: invoiceModel,
  idempotency: true
};

invoice.get = requestManager.describe({
  path: '/v1/invoices/:id',
  method: 'GET'
});
