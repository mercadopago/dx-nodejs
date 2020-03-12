var request = require('request');
var Promise = require('bluebird');
var uuid = require('uuid');
var configurations = require('./configurations');
var metrics = require('./metrics');
var MercadopagoResponse = require('./utils/mercadopagoResponse');
var MercadoPagoError = require('./utils/mercadopagoError');
var validation = require('./validation');
var ETagRequest = require('request-etag');
var preConditions = require('./precondition');

var requestManager = module.exports = {
  JSON_MIME_TYPE: 'application/json',
  FORM_MIME_TYPE: 'application/x-www-form-urlencoded',
  REST_CLIENT: new ETagRequest({
    max: configurations.cache_max_size
  }, request)
};

/**
 * Creates a dynamic function depending on the options that are send by the resources
 * @param options
 * @returns {Function}
 */
requestManager.describe = function (options) {
  // This method will have the context of the class that is calling this (Will have the context of the class)
  return function () {
    var optMethod = requestManager.clone({}, options);
    var calledArgs = arguments;

    return new Promise(function (resolve, reject) {
      var callback = calledArgs[calledArgs.length - 1]; // Last argument will always be the callback
      var pathParameters = requestManager.getPathParamsKeyNames(optMethod.path);
      var missingPayloadProperties = []; // Stores the missing payload path params (if there is any). POST, PUT, PATCH
      var schema = this.schema; // Schema from resource
      var needIdempotency = !!this.idempotency; // Idempotency from resource
      var needPartnersHeaders = !!this.partnersHeaders;
      var config = {};
      var payload = {};
      var error;
      var totalFunctionParams;
      var haveConfig = false;

      // If callback doesn't exists add it to the arguments (Prevent code to fail)
      if (typeof callback !== 'function' || callback === undefined) {
        // Arguments is not a pure array. You need to make a normal array out of it. If not arguments.length won't work
        calledArgs = Array.prototype.slice.call(calledArgs);
        calledArgs.push(callback = function () {});
      }

      // If it is GET or DELETE the path variables needs to come from arguments
      if (optMethod.method === 'GET' || optMethod.method === 'DELETE') {
        haveConfig = (typeof calledArgs[calledArgs.length - 2] === 'object');
        totalFunctionParams = (haveConfig) ? (pathParameters.length + 2) : (pathParameters.length + 1);

        // Set the configurations
        if (haveConfig) config = calledArgs[calledArgs.length - 2];

        // Verify arguments quantity (invalid function call)
        if (totalFunctionParams > calledArgs.length) {
          error = new Error('Expecting parameters: ' + pathParameters.join(', ').replace(/:/g, ''));
          reject(error);
          return callback.apply(null, [error, null]);
        }

        // Replace the path parameters for the variables from the args(same Index that the one declarated on the path)
        pathParameters.forEach(function (param, index) {
          optMethod.path = optMethod.path.replace(param, calledArgs[index]);
        });
      } else {
        haveConfig = (calledArgs.length > 2);

        // If configurations are sent, set configurations and payload depending on the correspondent argument index
        if (haveConfig) {
          if (typeof calledArgs[calledArgs.length - 2] === 'object') config = calledArgs[calledArgs.length - 2];
          if (typeof calledArgs[calledArgs.length - 3] === 'object') payload = calledArgs[calledArgs.length - 3];
        } else if (typeof calledArgs[calledArgs.length - 2] === 'object') {
          payload = calledArgs[calledArgs.length - 2];
        }

        // Replace the path parameters from the ones on the payload
        pathParameters.forEach(function (param) {
          var propertyFromPayload = param.replace(':', '');

          if (payload && payload[propertyFromPayload]) {
            optMethod.path = optMethod.path.replace(param, payload[propertyFromPayload]);
            // Remove it from the payload or MercadoPago API will return an error for invalid parameter
            delete payload[propertyFromPayload];
          } else {
            missingPayloadProperties.push(propertyFromPayload);
          }
        });

        // If there are any missing properties show an error (invalid function call)
        if (missingPayloadProperties.length > 0) {
          error = new Error('The JSON is missing the following properties: ' + missingPayloadProperties.join(', '));
          reject(error);
          return callback.apply(null, [error, null]);
        }
      }

      // If the path requires /sandbox prefix on sandbox mode, prepend it
      if (optMethod.path_sandbox_prefix !== undefined && optMethod.path_sandbox_prefix && configurations.sandbox) {
        optMethod.path = '/sandbox' + optMethod.path;
      }

      // Generate the AccessToken first (required to work with MercadoPago API)
      return requestManager.generateAccessToken().then(function (accessToken) {
        return requestManager.exec({
          schema: schema,
          base_url: (optMethod.base_url !== undefined) ? optMethod.base_url : '', // Overrides the base URI
          path: optMethod.path,
          method: optMethod.method,
          config: config, // Configurations object
          payload: payload, // Payload to send
          idempotency: needIdempotency, // Needs the idempotency header
          // If the merchant provides an access_token, it should override the access_token configured on init
          access_token: config.access_token ? config.access_token : accessToken,
          platformId: needPartnersHeaders || configurations.getPlatformId(),
          corporationId: needPartnersHeaders || configurations.getCorporationId(),
          integratorId: needPartnersHeaders || configurations.getIntegratorId(),
        });
      }).then(function (response) {
        resolve(response);
        return callback.apply(null, [null, response]);
      }).catch(function (err) {
        reject(err);
        return callback.apply(null, [err, null]);
      });
    }.bind(this));
  };
};

/**
 * Generate the access_token using the client_id and client_secret
 * @param callback
 */
requestManager.generateAccessToken = function (callback) {
  var error;

  callback = preConditions.getCallback(callback);

  return new Promise(function (resolve, reject) {
    // If the access_token is already set, return it from configurations
    if (configurations.getAccessToken()) {
      resolve(configurations.getAccessToken());
      return callback.apply(null, [null, configurations.getAccessToken()]);
    }

    // If the SDK is not yet configure
    if (!configurations.getClientId() || !configurations.getClientSecret()) {
      error = new MercadoPagoError('Must set client_id and client_secret', '', 500, '');
      reject(error);
      return callback.apply(null, [error, null]);
    }

    return requestManager.exec({
      path: '/oauth/token',
      method: 'POST',
      payload: {
        client_id: configurations.getClientId(),
        client_secret: configurations.getClientSecret(),
        grant_type: 'client_credentials'
      }
    }).then(function (response) {
      // Save token on configurations
      // configurations.setAccessToken(response.body.access_token).setRefreshToken(response.body.refresh_token);

      resolve(response.body.access_token);
      return callback.apply(null, [null, response.body.access_token]);
    }).catch(function (err) {
      reject(err);
      return callback.apply(null, [err, null]);
    });
  });
};

/**
 * Set the new access_token using the previous one & the refresh_token
 * @param callback
 * @returns {*}
 */
requestManager.refreshAccessToken = function (callback) {
  var error;

  callback = preConditions.getCallback(callback);

  return new Promise(function (resolve, reject) {
    // Check if the refresh token is configure (require to refresh the access_token)
    if (!configurations.getRefreshToken()) {
      error = new MercadoPagoError('You need the refresh_token to refresh the access_token', '', 500, '');
      reject(error);
      return callback.apply(null, [error, null]);
    }

    return requestManager.exec({
      path: '/oauth/token',
      method: 'POST',
      payload: {
        client_secret: configurations.getAccessToken(),
        grant_type: 'refresh_token'
      }
    }).then(function (response) {
      configurations.setAccessToken(response.body.access_token)
        .setRefreshToken(response.body.refresh_token);

      resolve(response.body.access_token);
      return callback.apply(null, [null, response.body.access_token]);
    }).catch(function (err) {
      reject(err);
      return callback.apply(null, [err, null]);
    });
  });
};

/**
 * Get user access_token (mpconnect) using the access_token, code, redirect_uri
 * @param clientSecret - access_token from MercadoPago
 * @param authorizationCode - authrozication_code obtain from redirectURI
 * @param redirectURI - The one you use for obtaining the authrozication_code
 * @param callback
 */
requestManager.getUserCredentials = function (clientSecret, authorizationCode, redirectURI, callback) {
  callback = preConditions.getCallback(callback);

  return new Promise(function (resolve, reject) {
    return requestManager.exec({
      path: '/oauth/token',
      method: 'POST',
      payload: {
        client_secret: clientSecret,
        code: authorizationCode,
        redirect_uri: redirectURI,
        grant_type: 'authorization_code'
      }
    }).then(function (response) {
      resolve(response);
      return callback.apply(null, [null, response]);
    }).catch(function (err) {
      reject(err);
      return callback.apply(null, [err, null]);
    });
  });
};

/**
 * Build the request using the options send and the configurations
 * @param options
 * @returns {object}
 */
requestManager.buildRequest = function (options) {
  var req = {};
  var schemaErrors = [];
  var headersNames = [];
  var headerName;
  var i;

  req.uri = (options.base_url) ? options.base_url + options.path : configurations.getBaseUrl() + options.path;
  req.method = options.method;
  req.headers = {
    'user-agent': configurations.getUserAgent(),
    'x-product-id': configurations.getProductId(),
    'x-tracking-id': configurations.getTrackingId(),
    accept: requestManager.JSON_MIME_TYPE,
    'content-type': requestManager.JSON_MIME_TYPE
  };
  req.qs = (options.config && options.config.qs) ? options.config.qs : {}; // Always set the querystring object
  req.json = true; // Autoparse the response to JSON

  if(options.integratorId) {
    req.headers['x-integrator-id'] = options.integratorId;
  }

  if(options.corporationId) {
    req.headers['x-corporation-id'] = options.corporationId;
  }

  if(options.platformId) {
    req.headers['x-platform-id'] = options.platformId;
  }

  if (options.config && options.config.headers && typeof options.config.headers === 'object') {
    headersNames = Object.keys(options.config.headers);
    for (i = 0; i < headersNames.length; i += 1) {
      headerName = headersNames[i];
      if (headerName !== 'user-agent' && headerName !== 'x-idempotency-key'
        && Object.prototype.hasOwnProperty.call(options.config.headers, headerName)) {
        req.headers[headerName] = options.config.headers[headerName];
      }
    }
  }

  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    // Set idempotency header if the resource needs idempotency of the config specified one
    if (options.idempotency || (options.config && options.config.idempotency)) {
      req.headers['x-idempotency-key'] = options.config.idempotency || uuid.v4();
    }
    if (req.headers['content-type'] === requestManager.JSON_MIME_TYPE) {
      // If there is a schema available, validate the payload before continue
      if (options.schema) {
        schemaErrors = validation.validate(options.schema, options.payload);

        if (schemaErrors.length > 0) {
          throw new Error(validation.generateErrorMessage(schemaErrors));
        }
      }

      req.json = options.payload;
    } else {
      req.form = options.payload;
    }
  }

  // Always add the access_token to the querystring
  req.qs.access_token = (options.config && options.config.access_token) ? options.config.access_token : options.access_token;
  // Requires SSL certificates be valid
  req.strictSSL = true;

  return req;
};

/**
 * Executes the request build with the options sent
 * @param options
 * @param callback
 */
requestManager.exec = function (options, callback) {
  callback = preConditions.getCallback(callback);

  return new Promise(function (resolve, reject) {
    var startRequestMillis = new Date().getTime();
    var req;
    var mpResponse;
    var mpError;

    try {
      req = requestManager.buildRequest(options);
    } catch (e) {
      reject(e);
      return callback.apply(null, [e, null]);
    }

    var startMillis = new Date().getTime();
    return requestManager.REST_CLIENT(req, function (error, response, body) {
      metrics.sendQuietly(req['uri'], req, response, startMillis, new Date().getTime(), startRequestMillis);
      if (error) {
        // Create a mercadopagoError allowing to retry the operation
        mpError = new MercadoPagoError(error.message, null, null, req.headers['x-idempotency-key'], options, this);
        reject(mpError);
        return callback.apply(null, [mpError, null]);
      }

      if (response.statusCode < 200 || (response.statusCode >= 300 && response.statusCode !== 304)) {
        // Create a mercadopagoError allowing to retry the operation
        mpError = new MercadoPagoError(body.message, body.cause, response.statusCode, req.headers['x-idempotency-key'],
          options, this);
        reject(mpError);
        return callback.apply(null, [mpError, null]);
      }

      // Create a mercadopagoResponse to be returned
      mpResponse = new MercadopagoResponse(body, response.statusCode, req.headers['x-idempotency-key'],
        body.paging, options, this);

      resolve(mpResponse);
      return callback.apply(null, [null, mpResponse]);
    });
  }.bind(this));
};

/**
 * Get path params key names from a String containing the path. Exp: '/v1/payments/:id' (Generate an array with :id)
 * @param path
 * @returns {Array}
 */
requestManager.getPathParamsKeyNames = function (path) {
  return path.match(/(:[a-z|A-Z|_|-]*)/g) || [];
};

/**
 * Object.assign polyfill
 * @param target
 * @returns {any}
 */
requestManager.clone = function (target) {
  if (target == null) { // TypeError if undefined or null
    throw new TypeError('Cannot convert undefined or null to object');
  }

  var to = Object(target);

  for (var index = 1; index < arguments.length; index++) {
    var nextSource = arguments[index];

    if (nextSource != null) { // pasamos si es undefined o null
      for (var nextKey in nextSource) {
        // Evita un error cuando 'hasOwnProperty' ha sido sobrescrito
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          to[nextKey] = nextSource[nextKey];
        }
      }
    }
  }
  return to;
};
