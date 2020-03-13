var syncrequest = require('sync-request');
var os = require('os');
var configurations = require('./configurations');

var metrics = module.exports = {};

var HEADER_X_INSIGHTS_METRIC_LAB_SCOPE = 'X-Insights-Metric-Lab-Scope';
var HEADER_X_INSIGHTS_BUSINESS_FLOW = 'X-Insights-Business-Flow';
var HEADER_X_PRODUCT_ID = 'X-Product-Id';
var HEADER_X_INSIGHTS_EVENT_NAME = 'X-Insights-Event-Name';
var JSON_MIME_TYPE = 'application/json';

var sendDataDeadlineMillis = 0;
var trafficLight = { 'send-data': true, ttl: 600 };

metrics.sendQuietly = function (url, request, response, startMillis, endMillis, startRequestMillis) {
  if (metrics.isInsightMetricsEnable(url)) {
    metrics.sendMetrics(request, response, startMillis, endMillis, startRequestMillis);
  }
};

metrics.isInsightMetricsEnable = function (url) {
  if (new Date().getTime() > sendDataDeadlineMillis) {
    metrics.callTrafficLight();
  }
  if (trafficLight.enabled || metrics.isEndpointInWhiteList(url)) {// && !!!
      return true;
  }
  return false;
};

metrics.callTrafficLight = function () {
  var req = {};

  var uri = configurations.getBaseInsightMetricsUrl() + configurations.getInsightMetricsTrafficLightApi();

  req['headers'] = {};
  req['headers']['accept'] = JSON_MIME_TYPE;
  req['headers']['content-type'] = JSON_MIME_TYPE;
  req['headers'][HEADER_X_INSIGHTS_METRIC_LAB_SCOPE] = configurations.getMetricsScope();

  req['json'] = {};
  req['json']['client-info'] = {};
  req['json']['client-info']['name'] = configurations.getClientName();
  req['json']['client-info']['version'] = configurations.getVersion();

  var response = syncrequest('POST', uri, req);
  trafficLight = JSON.parse(response.getBody('utf8'));
  sendDataDeadlineMillis = new Date().getTime() + (trafficLight.ttl * 1000);
};

/**
 * Send insight metrics 
 * @param request
 * @param response
 * @param startMillis
 * @param endMillis
 * @param startRequestMillis
 */
metrics.sendMetrics = function (request, response, startMillis, endMillis, startRequestMillis) {
  var req = {};
  var uri = configurations.getBaseInsightMetricsUrl() + configurations.getInsightMetricsApi();
  
  req['headers'] = {};
  req['headers']['accept'] = JSON_MIME_TYPE;
  req['headers']['content-type'] = JSON_MIME_TYPE;
  req['headers'][HEADER_X_INSIGHTS_METRIC_LAB_SCOPE] = configurations.getMetricsScope();

  req['json'] = {};
  req['json']['client-info'] = {};
  req['json']['client-info']['name'] = configurations.getClientName();
  req['json']['client-info']['version'] = configurations.getVersion();

  req['json']['business-flow-info'] = {};
  req['json']['business-flow-info']['name'] = request[HEADER_X_INSIGHTS_BUSINESS_FLOW];
  req['json']['business-flow-info']['uid'] = request[HEADER_X_PRODUCT_ID];
  
  req['json']['event-info'] = {};
  req['json']['event-info']['name'] = request[HEADER_X_INSIGHTS_EVENT_NAME];

  req['json']['connection-info'] = {};
  //req['json']['connection-info']['network-type'] = '';
  //req['json']['connection-info']['network-speed'] = '';
  req['json']['connection-info']['user-agent'] = request['User-Agent'];
  //req['json']['connection-info']['was-reused'] = '';
  //req['json']['connection-info']['is-complete'] = '';
  
  //req['json']['connection-info']['dns-info'] = {};
  //req['json']['connection-info']['dns-info']['nameserver-address'] = '';
  //req['json']['connection-info']['dns-info']['total-lookup-time-millis'] = '';
  
  //req['json']['connection-info']['certificate-info'] = {};
  //req['json']['connection-info']['certificate-info']['certificate-type'] = '';
  //req['json']['connection-info']['certificate-info']['certificate-version'] = '';
  //req['json']['connection-info']['certificate-info']['certificate-expiration'] = '';
  //req['json']['connection-info']['certificate-info']['handshake-time-millis'] = '';

  req['json']['connection-info']['protocol-info'] = {};
  req['json']['connection-info']['protocol-info']['name'] = 'http';
  //req['json']['connection-info']['protocol-info']['retry-count'] = '';
  req['json']['connection-info']['protocol-info']['protocol-http'] = {};
  //req['json']['connection-info']['protocol-info']['protocol-http']['referer-url'] = '';
  req['json']['connection-info']['protocol-info']['protocol-http']['request-method'] = request.method;
  req['json']['connection-info']['protocol-info']['protocol-http']['request-url'] = request.uri;
  req['json']['connection-info']['protocol-info']['protocol-http']['request-headers'] = request.headers;
  req['json']['connection-info']['protocol-info']['protocol-http']['response-status-code'] = response.statusCode;
  req['json']['connection-info']['protocol-info']['protocol-http']['response-headers'] = response.headers;
  req['json']['connection-info']['protocol-info']['protocol-http']['first-byte-time-millis'] = startMillis - startRequestMillis;
  req['json']['connection-info']['protocol-info']['protocol-http']['last-byte-time-millis'] = endMillis - startMillis;
  //req['json']['connection-info']['protocol-info']['protocol-http']['was-cached'] = '';

  //req['json']['connection-info']['tcp-info'] = {};
  //req['json']['connection-info']['tcp-info']['source-address'] = '';
  //req['json']['connection-info']['tcp-info']['target-address'] = '';
  //req['json']['connection-info']['tcp-info']['handshake-time-millis'] = '';

  req['json']['device-info'] = {};
  req['json']['device-info']['os-name'] = os.platform();
  req['json']['device-info']['model-name'] = os.type();
  req['json']['device-info']['cpu-type'] = os.cpus()[0].model;
  req['json']['device-info']['ram-size'] = os.totalmem();

  //req['json']['encoded-data'] = '';
  
  console.log(req);
  console.log(req['json']['connection-info']['protocol-info']['protocol-http']);
  var a = syncrequest('POST', uri, req);
  console.log(JSON.parse(a.getBody('utf8')));
};

metrics.isEndpointInWhiteList = function (url) {
  //regular expression to validate url in trafficLight.endpointWhiteList
  return true;
};
