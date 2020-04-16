(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.timesync = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = emitter;
/**
 * Turn an object into an event emitter. Attaches methods `on`, `off`,
 * `emit`, and `list`
 * @param {Object} obj
 * @return {Object} Returns the original object, extended with emitter functions
 */
function emitter(obj) {
  var _callbacks = {};

  obj.emit = function (event, data) {
    var callbacks = _callbacks[event];
    callbacks && callbacks.forEach(function (callback) {
      return callback(data);
    });
  };

  obj.on = function (event, callback) {
    var callbacks = _callbacks[event] || (_callbacks[event] = []);
    callbacks.push(callback);
    return obj;
  };

  obj.off = function (event, callback) {
    if (callback) {
      var callbacks = _callbacks[event];
      var index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        delete _callbacks[event];
      }
    } else {
      delete _callbacks[event];
    }
    return obj;
  };

  obj.list = function (event) {
    return _callbacks[event] || [];
  };

  return obj;
}

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetch = fetch;
exports.post = post;
function fetch(method, url, body, headers, callback, timeout) {
  try {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        var contentType = xhr.getResponseHeader('Content-Type');
        if (contentType && contentType.indexOf('json') !== -1) {
          try {
            // return JSON object
            var response = JSON.parse(xhr.responseText);
            callback(null, response, xhr.status);
          } catch (err) {
            callback(err, null, xhr.status);
          }
        } else {
          // return text
          callback(null, xhr.responseText, xhr.status);
        }
      }
    };
    if (headers) {
      for (var name in headers) {
        if (headers.hasOwnProperty(name)) {
          xhr.setRequestHeader(name, headers[name]);
        }
      }
    }

    xhr.ontimeout = function (err) {
      callback(err, null, 0);
    };

    xhr.open(method, url, true);
    xhr.timeout = timeout;

    if (typeof body === 'string') {
      xhr.send(body);
    } else if (body) {
      // body is an object
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(body));
    } else {
      xhr.send();
    }
  } catch (err) {
    callback(err, null, 0);
  }
}

function post(url, body, timeout) {
  return new Promise(function (resolve, reject) {
    var callback = function callback(err, res, status) {
      if (err) {
        return reject(err);
      }

      resolve([res, status]);
    };

    fetch('POST', url, body, null, callback, timeout);
  });
}

},{}],3:[function(require,module,exports){
'use strict';

var isBrowser = typeof window !== 'undefined';

// FIXME: how to do conditional loading this with ES6 modules?
module.exports = isBrowser ? require('./request.browser') : require('./request.node');

},{"./request.browser":2,"./request.node":4}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.post = post;

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var parseUrl = _url2.default.parse;

function post(url, body, timeout) {
  return new Promise(function (resolve, reject) {
    var data = body === 'string' ? body : JSON.stringify(body);
    var urlObj = parseUrl(url);

    // An object of options to indicate where to post to
    var options = {
      host: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.path,
      method: 'POST',
      headers: { 'Content-Length': data.length }
    };

    if (body !== 'string') {
      options.headers['Content-Type'] = 'application/json';
    }

    var proto = urlObj.protocol === 'https:' ? _https2.default : _http2.default;

    var req = proto.request(options, function (res) {
      res.setEncoding('utf8');
      var result = '';
      res.on('data', function (data) {
        result += data;
      });

      res.on('end', function () {
        var contentType = res.headers['content-type'];
        var isJSON = contentType && contentType.indexOf('json') !== -1;

        try {
          var body = isJSON ? JSON.parse(result) : result;

          resolve([body, res.statusCode]);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);

    req.on('socket', function (socket) {
      socket.setTimeout(timeout, function () {
        req.abort();
      });
    });

    req.write(data);
    req.end();
  });
}

},{"http":undefined,"https":undefined,"url":undefined}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compare = compare;
exports.add = add;
exports.sum = sum;
exports.mean = mean;
exports.std = std;
exports.variance = variance;
exports.median = median;
// basic statistical functions

function compare(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
}

function add(a, b) {
  return a + b;
}

function sum(arr) {
  return arr.reduce(add);
}

function mean(arr) {
  return sum(arr) / arr.length;
}

function std(arr) {
  return Math.sqrt(variance(arr));
}

function variance(arr) {
  if (arr.length < 2) return 0;

  var _mean = mean(arr);
  return arr.map(function (x) {
    return Math.pow(x - _mean, 2);
  }).reduce(add) / (arr.length - 1);
}

function median(arr) {
  if (arr.length < 2) return arr[0];

  var sorted = arr.slice().sort(compare);
  if (sorted.length % 2 === 0) {
    // even
    return (sorted[arr.length / 2 - 1] + sorted[arr.length / 2]) / 2;
  } else {
    // odd
    return sorted[(arr.length - 1) / 2];
  }
}

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;

var _util = require('./util.js');

var util = _interopRequireWildcard(_util);

var _stat = require('./stat.js');

var stat = _interopRequireWildcard(_stat);

var _request = require('./request/request');

var request = _interopRequireWildcard(_request);

var _emitter = require('./emitter.js');

var _emitter2 = _interopRequireDefault(_emitter);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }newObj.default = obj;return newObj;
  }
}

// not polyfilling for Promise
// var Promise = require('./Promise');

/**
 * Factory function to create a timesync instance
 * @param {Object} [options]  TODO: describe options
 * @return {Object} Returns a new timesync instance
 */
/**
 * timesync
 *
 * Time synchronization between peers
 *
 * https://github.com/enmasseio/timesync
 */

function create(options) {
  var timesync = {
    // configurable options
    options: {
      interval: 60 * 60 * 1000, // interval for doing synchronizations in ms. Set to null to disable auto sync
      timeout: 10000, // timeout for requests to fail in ms
      delay: 1000, // delay between requests in ms
      repeat: 5, // number of times to do a request to one peer
      peers: [], // uri's or id's of the peers
      server: null, // uri of a single server (master/slave configuration)
      now: Date.now // function returning the system time
    },

    /** @type {number} The current offset from system time */
    offset: 0, // ms

    /** @type {number} Contains the timeout for the next synchronization */
    _timeout: null,

    /** @type {Object.<string, function>} Contains a map with requests in progress */
    _inProgress: {},

    /**
     * @type {boolean}
     * This property used to immediately apply the first ever received offset.
     * After that, it's set to false and not used anymore.
     */
    _isFirst: true,

    /**
     * Send a message to a peer
     * This method must be overridden when using timesync
     * @param {string} to
     * @param {*} data
     */
    send: function send(to, data, timeout) {
      return request.post(to, data, timeout).then(function (val) {
        var res = val[0];

        timesync.receive(to, res);
      }).catch(function (err) {
        emitError(err);
      });
    },

    /**
     * Receive method to be called when a reply comes in
     * @param {string | undefined} [from]
     * @param {*} data
     */
    receive: function receive(from, data) {
      if (data === undefined) {
        data = from;
        from = undefined;
      }

      if (data && data.id in timesync._inProgress) {
        // this is a reply
        timesync._inProgress[data.id](data.result);
      } else if (data && data.id !== undefined) {
        // this is a request from an other peer
        // reply with our current time
        timesync.send(from, {
          jsonrpc: '2.0',
          id: data.id,
          result: timesync.now()
        });
      }
    },

    _handleRPCSendError: function _handleRPCSendError(id, reject, err) {
      delete timesync._inProgress[id];
      reject(new Error('Send failure'));
    },

    /**
     * Send a JSON-RPC message and retrieve a response
     * @param {string} to
     * @param {string} method
     * @param {*} [params]
     * @returns {Promise}
     */
    rpc: function rpc(to, method, params) {
      var id = util.nextId();
      var resolve, reject;
      var deferred = new Promise(function (res, rej) {
        resolve = res;
        reject = rej;
      });

      timesync._inProgress[id] = function (data) {
        delete timesync._inProgress[id];

        resolve(data);
      };

      var sendResult = void 0;

      try {
        sendResult = timesync.send(to, {
          jsonrpc: '2.0',
          id: id,
          method: method,
          params: params
        }, timesync.options.timeout);
      } catch (err) {
        timesync._handleRPCSendError(id, reject, err);
      }

      if (sendResult && (sendResult instanceof Promise || sendResult.then && sendResult.catch)) {
        sendResult.catch(timesync._handleRPCSendError.bind(this, id, reject));
      } else {
        console.warn('Send should return a promise');
      }

      return deferred;
    },

    /**
     * Synchronize now with all configured peers
     * Docs: http://www.mine-control.com/zack/timesync/timesync.html
     */
    sync: function sync() {
      timesync.emit('sync', 'start');

      var peers = timesync.options.server ? [timesync.options.server] : timesync.options.peers;
      return Promise.all(peers.map(function (peer) {
        return timesync._syncWithPeer(peer);
      })).then(function (all) {
        var offsets = all.filter(function (offset) {
          return timesync._validOffset(offset);
        });
        if (offsets.length > 0) {
          // take the average of all peers (excluding self) as new offset
          timesync.offset = stat.mean(offsets);
          timesync.emit('change', timesync.offset);
        }
        timesync.emit('sync', 'end');
      });
    },

    /**
     * Test whether given offset is a valid number (not NaN, Infinite, or null)
     * @param {number} offset
     * @returns {boolean}
     * @private
     */
    _validOffset: function _validOffset(offset) {
      return offset !== null && !isNaN(offset) && isFinite(offset);
    },

    /**
     * Sync one peer
     * @param {string} peer
     * @return {Promise.<number | null>}  Resolves with the offset to this peer,
     *                                    or null if failed to sync with this peer.
     * @private
     */
    _syncWithPeer: function _syncWithPeer(peer) {
      // retrieve the offset of a peer, then wait 1 sec
      var all = [];

      function sync() {
        return timesync._getOffset(peer).then(function (result) {
          return all.push(result);
        });
      }

      function waitAndSync() {
        return util.wait(timesync.options.delay).then(sync);
      }

      function notDone() {
        return all.length < timesync.options.repeat;
      }

      return sync().then(function () {
        return util.whilst(notDone, waitAndSync);
      }).then(function () {
        // filter out null results
        var results = all.filter(function (result) {
          return result !== null;
        });

        // calculate the limit for outliers
        var roundtrips = results.map(function (result) {
          return result.roundtrip;
        });
        var limit = stat.median(roundtrips) + stat.std(roundtrips);

        // filter all results which have a roundtrip smaller than the mean+std
        var filtered = results.filter(function (result) {
          return result.roundtrip < limit;
        });
        var offsets = filtered.map(function (result) {
          return result.offset;
        });

        // return the new offset
        return offsets.length > 0 ? stat.mean(offsets) : null;
      });
    },

    /**
     * Retrieve the offset from one peer by doing a single call to the peer
     * @param {string} peer
     * @returns {Promise.<{roundtrip: number, offset: number} | null>}
     * @private
     */
    _getOffset: function _getOffset(peer) {
      var start = timesync.options.now(); // local system time

      return timesync.rpc(peer, 'timesync').then(function (timestamp) {
        var end = timesync.options.now(); // local system time
        var roundtrip = end - start;
        var offset = timestamp - end + roundtrip / 2; // offset from local system time

        // apply the first ever retrieved offset immediately.
        if (timesync._isFirst) {
          timesync._isFirst = false;
          timesync.offset = offset;
          timesync.emit('change', offset);
        }

        return {
          roundtrip: roundtrip,
          offset: offset
        };
      }).catch(function (err) {
        // just ignore failed requests, return null
        return null;
      });
    },

    /**
     * Get the current time
     * @returns {number} Returns a timestamp
     */
    now: function now() {
      return timesync.options.now() + timesync.offset;
    },

    /**
     * Destroy the timesync instance. Stops automatic synchronization.
     * If timesync is currently executing a synchronization, this
     * synchronization will be finished first.
     */
    destroy: function destroy() {
      clearTimeout(timesync._timeout);
    }
  };

  // apply provided options
  if (options) {
    if (options.server && options.peers) {
      throw new Error('Configure either option "peers" or "server", not both.');
    }

    for (var prop in options) {
      if (options.hasOwnProperty(prop)) {
        if (prop === 'peers' && typeof options.peers === 'string') {
          // split a comma separated string with peers into an array
          timesync.options.peers = options.peers.split(',').map(function (peer) {
            return peer.trim();
          }).filter(function (peer) {
            return peer !== '';
          });
        } else {
          timesync.options[prop] = options[prop];
        }
      }
    }
  }

  // turn into an event emitter
  (0, _emitter2.default)(timesync);

  /**
   * Emit an error message. If there are no listeners, the error is outputted
   * to the console.
   * @param {Error} err
   */
  function emitError(err) {
    if (timesync.list('error').length > 0) {
      timesync.emit('error', err);
    } else {
      console.log('Error', err);
    }
  }

  if (timesync.options.interval !== null) {
    // start an interval to automatically run a synchronization once per interval
    timesync._timeout = setInterval(timesync.sync, timesync.options.interval);

    // synchronize immediately on the next tick (allows to attach event
    // handlers before the timesync starts).
    setTimeout(function () {
      timesync.sync().catch(function (err) {
        return emitError(err);
      });
    }, 0);
  }

  return timesync;
}

},{"./emitter.js":1,"./request/request":3,"./stat.js":5,"./util.js":7}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wait = wait;
exports.repeat = repeat;
exports.whilst = whilst;
exports.nextId = nextId;
// not polyfilling for Promise
// var Promise = require('./Promise');

/**
 * Resolve a promise after a delay
 * @param {number} delay    A delay in milliseconds
 * @returns {Promise} Resolves after given delay
 */
function wait(delay) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay);
  });
}

/**
 * Repeat a given asynchronous function a number of times
 * @param {function} fn   A function returning a promise
 * @param {number} times
 * @return {Promise}
 */
function repeat(fn, times) {
  return new Promise(function (resolve, reject) {
    var count = 0;
    var results = [];

    function recurse() {
      if (count < times) {
        count++;
        fn().then(function (result) {
          results.push(result);
          recurse();
        });
      } else {
        resolve(results);
      }
    }

    recurse();
  });
}

/**
 * Repeat an asynchronous callback function whilst
 * @param {function} condition   A function returning true or false
 * @param {function} callback    A callback returning a Promise
 * @returns {Promise}
 */
function whilst(condition, callback) {
  return new Promise(function (resolve, reject) {
    function recurse() {
      if (condition()) {
        callback().then(function () {
          return recurse();
        });
      } else {
        resolve();
      }
    }

    recurse();
  });
}

/**
 * Simple id generator
 * @returns {number} Returns a new id
 */
function nextId() {
  return _id++;
}
var _id = 0;

},{}]},{},[6])(6)
});
