var mercadopagoIpnResponse = function(id, topic, status, body){
    this.id = id;
    this.topic = topic;
    this.status = status;
    this.body = body;
};

module.exports = mercadopagoIpnResponse;