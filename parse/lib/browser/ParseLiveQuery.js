'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _EventEmitter = require('./EventEmitter');

var _EventEmitter2 = _interopRequireDefault(_EventEmitter);

var _LiveQueryClient = require('./LiveQueryClient');

var _LiveQueryClient2 = _interopRequireDefault(_LiveQueryClient);

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

/**
 *
 * We expose three events to help you monitor the status of the WebSocket connection:
 *
 * <p>Open - When we establish the WebSocket connection to the LiveQuery server, you'll get this event.
 * 
 * <pre>
 * Parse.LiveQuery.on('open', () => {
 * 
 * });</pre></p>
 *
 * <p>Close - When we lose the WebSocket connection to the LiveQuery server, you'll get this event.
 * 
 * <pre>
 * Parse.LiveQuery.on('close', () => {
 * 
 * });</pre></p>
 *
 * <p>Error - When some network error or LiveQuery server error happens, you'll get this event.
 * 
 * <pre>
 * Parse.LiveQuery.on('error', (error) => {
 * 
 * });</pre></p>
 * 
 * @class Parse.LiveQuery
 * @static
 * 
 */
var LiveQuery = new _EventEmitter2['default']();

/**
 * After open is called, the LiveQuery will try to send a connect request
 * to the LiveQuery server.
 * 
 * @method open
 */
LiveQuery.open = function open() {
  var LiveQueryController = _CoreManager2['default'].getLiveQueryController();
  LiveQueryController.open();
};

/**
 * When you're done using LiveQuery, you can call Parse.LiveQuery.close().
 * This function will close the WebSocket connection to the LiveQuery server,
 * cancel the auto reconnect, and unsubscribe all subscriptions based on it.
 * If you call query.subscribe() after this, we'll create a new WebSocket
 * connection to the LiveQuery server.
 * 
 * @method close
 */

LiveQuery.close = function close() {
  var LiveQueryController = _CoreManager2['default'].getLiveQueryController();
  LiveQueryController.close();
};
// Register a default onError callback to make sure we do not crash on error
LiveQuery.on('error', function () {});

exports['default'] = LiveQuery;

var getSessionToken = function getSessionToken() {
  var promiseUser = _CoreManager2['default'].getUserController().currentUserAsync();
  return promiseUser.then(function (currentUser) {
    return _ParsePromise2['default'].as(currentUser ? currentUser.sessionToken : undefined);
  }).then(function (sessionToken) {
    return _ParsePromise2['default'].as(sessionToken);
  });
};

var getLiveQueryClient = function getLiveQueryClient() {
  return _CoreManager2['default'].getLiveQueryController().getDefaultLiveQueryClient().then(function (defaultLiveQueryClient) {
    return _ParsePromise2['default'].as(defaultLiveQueryClient);
  });
};

var defaultLiveQueryClient = undefined;

_CoreManager2['default'].setLiveQueryController({
  setDefaultLiveQueryClient: function setDefaultLiveQueryClient(liveQueryClient) {
    defaultLiveQueryClient = liveQueryClient;
  },
  getDefaultLiveQueryClient: function getDefaultLiveQueryClient() {
    if (defaultLiveQueryClient) {
      return _ParsePromise2['default'].as(defaultLiveQueryClient);
    }

    var sessionTokenPromise = getSessionToken();
    return sessionTokenPromise.then(function (sessionToken) {
      var liveQueryServerURL = _CoreManager2['default'].get('LIVEQUERY_SERVER_URL');

      if (liveQueryServerURL && liveQueryServerURL.indexOf('ws') !== 0) {
        throw new Error('You need to set a proper Parse LiveQuery server url before using LiveQueryClient');
      }

      // If we can not find Parse.liveQueryServerURL, we try to extract it from Parse.serverURL
      if (!liveQueryServerURL) {
        var tempServerURL = _CoreManager2['default'].get('SERVER_URL');
        var protocol = 'ws://';
        // If Parse is being served over SSL/HTTPS, ensure LiveQuery Server uses 'wss://' prefix
        if (tempServerURL.indexOf('https') === 0) {
          protocol = 'wss://';
        }
        var host = tempServerURL.replace(/^https?:\/\//, '');
        liveQueryServerURL = protocol + host;
        _CoreManager2['default'].set('LIVEQUERY_SERVER_URL', liveQueryServerURL);
      }

      var applicationId = _CoreManager2['default'].get('APPLICATION_ID');
      var javascriptKey = _CoreManager2['default'].get('JAVASCRIPT_KEY');
      var masterKey = _CoreManager2['default'].get('MASTER_KEY');
      // Get currentUser sessionToken if possible
      defaultLiveQueryClient = new _LiveQueryClient2['default']({
        applicationId: applicationId,
        serverURL: liveQueryServerURL,
        javascriptKey: javascriptKey,
        masterKey: masterKey,
        sessionToken: sessionToken
      });
      // Register a default onError callback to make sure we do not crash on error
      // Cannot create these events on a nested way because of EventEmiiter from React Native
      defaultLiveQueryClient.on('error', function (error) {
        LiveQuery.emit('error', error);
      });
      defaultLiveQueryClient.on('open', function () {
        LiveQuery.emit('open');
      });
      defaultLiveQueryClient.on('close', function () {
        LiveQuery.emit('close');
      });

      return _ParsePromise2['default'].as(defaultLiveQueryClient);
    });
  },
  open: function open() {
    var _this = this;

    getLiveQueryClient().then(function (liveQueryClient) {
      _this.resolve(liveQueryClient.open());
    });
  },
  close: function close() {
    var _this2 = this;

    getLiveQueryClient().then(function (liveQueryClient) {
      _this2.resolve(liveQueryClient.close());
    });
  },
  subscribe: function subscribe(query) {
    var _this3 = this;

    var subscriptionWrap = new _EventEmitter2['default']();

    getLiveQueryClient().then(function (liveQueryClient) {
      if (liveQueryClient.shouldOpen()) {
        liveQueryClient.open();
      }
      var promiseSessionToken = getSessionToken();
      // new event emitter
      return promiseSessionToken.then(function (sessionToken) {

        var subscription = liveQueryClient.subscribe(query, sessionToken);
        // enter, leave create, etc

        subscriptionWrap.id = subscription.id;
        subscriptionWrap.query = subscription.query;
        subscriptionWrap.sessionToken = subscription.sessionToken;
        subscriptionWrap.unsubscribe = subscription.unsubscribe;
        // Cannot create these events on a nested way because of EventEmiiter from React Native
        subscription.on('open', function () {
          subscriptionWrap.emit('open');
        });
        subscription.on('create', function (object) {
          subscriptionWrap.emit('create', object);
        });
        subscription.on('update', function (object) {
          subscriptionWrap.emit('update', object);
        });
        subscription.on('enter', function (object) {
          subscriptionWrap.emit('enter', object);
        });
        subscription.on('leave', function (object) {
          subscriptionWrap.emit('leave', object);
        });
        subscription.on('delete', function (object) {
          subscriptionWrap.emit('delete', object);
        });

        _this3.resolve();
      });
    });
    return subscriptionWrap;
  },
  unsubscribe: function unsubscribe(subscription) {
    var _this4 = this;

    getLiveQueryClient().then(function (liveQueryClient) {
      _this4.resolve(liveQueryClient.unsubscribe(subscription));
    });
  }
});
module.exports = exports['default'];