[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg?style=flat)](https://github.com/mercadopago/px-nodejs)
[![Build Status](https://img.shields.io/travis/mercadopago/px-nodejs/master.svg)](https://travis-ci.org/mercadopago/px-nodejs)
[![Coverage Status](https://coveralls.io/repos/github/mercadopago/px-nodejs/badge.svg?branch=master)](https://coveralls.io/github/mercadopago/px-nodejs?branch=master)
[![NPM Version](https://img.shields.io/npm/v/mercadopago.svg)](http://npmjs.com/package/mercadopago)
[![Downloads](https://img.shields.io/npm/dt/mercadopago.svg)](http://npmjs.com/package/mercadopago)
 
# MercadoPago Node.js SDK

This library provides developers with a simple set of bindings to the MercadoPago API. You can read the full [documentation here](https://github.com/mercadopago/px-nodejs/wiki).


**Warning**: [Important updates in changelog](CHANGELOG.MD)

### Node.js Versions Support

The SDK Supports Node.js from version v0 to the latest (v7).

### Backward Compatiblity

If you implemented the [previous SDK](https://github.com/mercadopago/sdk-nodejs), you don't need to do **anything**. Just update the NPM Package and you will received all of the [previous methods](https://github.com/mercadopago/px-nodejs/wiki/Backward-Compatibility).

### Installation

```sh
$ npm install mercadopago
```

or saving as a dependency on your `package.json`

```sh
$ npm install --save mercadopago
```

### Credentials

Before you use the SDK, you need to get your credentials from the following address:

* Argentina: [https://www.mercadopago.com/mla/account/credentials](https://www.mercadopago.com/mla/account/credentials)
* Brazil: [https://www.mercadopago.com/mlb/account/credentials](https://www.mercadopago.com/mlb/account/credentials)
* Mexico: [https://www.mercadopago.com/mlm/account/credentials](https://www.mercadopago.com/mlm/account/credentials)
* Venezuela: [https://www.mercadopago.com/mlv/account/credentials](https://www.mercadopago.com/mlv/account/credentials)
* Colombia: [https://www.mercadopago.com/mco/account/credentials](https://www.mercadopago.com/mco/account/credentials)
* Chile: [https://www.mercadopago.com/mlc/account/credentials](https://www.mercadopago.com/mlc/account/credentials)
* Uruguay: [https://www.mercadopago.com/mlu/account/credentials](https://www.mercadopago.com/mlu/account/credentials)
* Perú: [https://www.mercadopago.com/mpe/account/credentials](https://www.mercadopago.com/mpe/account/credentials)

> We highly recomend using only the access_token. If you provide the client_id and client_secret it's going to generate the access_token anyway (only on Production, for Sandbox use access_token).

### Quick Start

First you need to require the library

```javascript
var mercadopago = require('mercadopago');
```

Then you need to configure it with your credentials:

```javascript
mercadopago.configure({
    access_token: 'ACCESS_TOKEN'
});
```

You **don't need to instantiate** `mercadopago`. It's a global singleton accross your application. Just require the SDK in any other file and it's already configured with your credentials.

## Operations & Resources

* [Payment](https://github.com/mercadopago/px-nodejs/wiki/Payment)
* [Preferences](https://github.com/mercadopago/px-nodejs/wiki/Preferences)
* [Pre Approval](https://github.com/mercadopago/px-nodejs/wiki/Pre-Approval)
* [Customers & Cards](https://github.com/mercadopago/px-nodejs/wiki/Customers-&-Cards)
* [Merchant Orders](https://github.com/mercadopago/px-nodejs/wiki/Merchant-Orders)
* [Money Requests](https://github.com/mercadopago/px-nodejs/wiki/Money-Requests)
* [MercadoPago Connect](https://github.com/mercadopago/px-nodejs/wiki/MercadoPago-Connect)
* [IPN Notifications](https://github.com/mercadopago/px-nodejs/wiki/IPN-Notifications)
* Plans (doc. in progress)
* Subscriptions (doc. in progress)

## Examples

In the examples folder you will find a web application. In this you can try some examples. For more information read the [documentation here](https://github.com/mercadopago/px-nodejs/tree/master/examples).

### Testing

This project is tested using:

- Mocha
- Chai
- Sinon

You can see the current [coverage here](https://coveralls.io/github/mercadopago/dx-nodejs?branch=master).

### Links
* [Documentation](https://github.com/mercadopago/px-nodejs/wiki)
* [API Documentation](http://developers.mercadopago.com)

### License

Copyright © 2017.
