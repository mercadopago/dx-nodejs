var requestManager = require('../request-manager'),
    preapprovalModule = require('./preapproval'),
    mercadopagoIpnResponse = require('../utils/mercadopagoIpnResponse'),
    Promise = require('bluebird');

var ipn = module.exports = {
    available_topics: ['preapproval', 'authorized_payment', 'payment']
};

ipn.getPayment = requestManager.describe({
    path: '/collections/notifications/:id',
    path_sandbox_prefix: true,
    method: 'GET'
});

ipn.getAuthorizedPayment = requestManager.describe({
    path: '/authorized_payments/:id',
    method: 'GET'
});

/**
 * Manage the request obtain by the ipn endpoint
 * @param request
 * @param callback
 * @returns {*}
 */
ipn.manage = function(request, callback){
    var me = this;

    if(callback === undefined || typeof callback !== 'function') callback = function(){};

    return new Promise(function(resolve, reject){
        var id = request.query.id,
            topic = request.query.topic;

        if( me.available_topics.indexOf(topic) !== -1 ){
            me[topic](id, function(err, mpResponse){
                if(err){
                    reject(err);
                    return callback.apply(null, [err, null])
                }

                var mpResponse = new mercadopagoIpnResponse(id, topic, mpResponse.status, mpResponse.body);
                resolve(mpResponse);
                return callback.apply(null, [null, mpResponse]);
            });
        }else{
            var mpError = new Error('Invalid Topic (' + topic + '). The topics available are: ' + me.available_topics.join(', '));
            reject(mpError);
            return callback.apply(null, [mpError, null]);
        }
    });
};

ipn.payment = function(id, callback){
    return this.getPayment(id, callback);
};

ipn.authorized_payment = function(id, callback){
    return this.getAuthorizedPayment(id, callback);
};

ipn.preapproval = function(id, callback){
    return preapprovalModule.get(id, callback);
};