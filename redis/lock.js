'use strict';

const Redlock = require('redlock'),
  { logGenericError } = require('../services/errors'),
  emptyModule = {
    lock: () => Promise.resolve(),
    unlock: () => Promise.resolve()
  },
  CONFIG = {
    // the expected clock drift; for more details
    // see http://redis.io/topics/distlock
    driftFactor: 0.01, // time in ms

    // the max number of times Redlock will attempt
    // to lock a resource before erroring
    retryCount: 0,

    // the time in ms between attempts
    retryDelay: 200, // time in ms

    // the max time in ms randomly added to retries
    // to improve performance under high contention
    // see https://www.awsarchitectureblog.com/2015/03/backoff.html
    retryJitter: 200 // time in ms
  },
  STATE = {
    ONGOING: 'ON-GOING',
    RETRY: 'RETRY',
    FINISHED: 'FINISHED'
  },
  RETRY_TIME = 1500, // ms
  KEY_TTL = 10 * 60, // secs
  LOCK_TTL = 5000, // ms
  actionRetryTotal = 5;

let log = require('../services/log').setup({ file: __filename }),
  actionRetryCount = 0;

/**
 * Adds a lock to redis with the given lockName
 * for a determined period of time
 *
 * @param {string} lockName
 * @param {number} ttl
 * @returns {Promise}
 */
function addLock(lockName, ttl) {
  log('trace', `Trying to lock redis for resource id ${lockName}`, {
    lockName,
    processId: process.pid
  });
  return module.exports.redlock.lock(lockName, ttl);
}

/**
 * Removes the specified lock
 * when the callback returns
 *
 * @param {Object} lock
 * @param {string} lockName
 * @param {Function} cb Must return a promise
 * @returns {Promise}
 */
function removeLockWhenReady(lock, lockName, cb) {
  return cb().then(result =>
    module.exports.redlock.unlock(lock).then(() => {
      log('trace', `Releasing lock for resource id ${lockName}`, {
        lockName,
        processId: process.pid
      });
      return result;
    })
  );
}

/**
 * Gets the value of the specified key in redis
 *
 * @param {string} key
 * @returns {Promise}
 */
function getState(key) {
  return module.exports.redis.getAsync(key);
}

/**
 * Sets a key-value pair into redis.
 * This key will have an expire time if specified
 * @param {string} key
 * @param {string} value
 * @param {number} expireTime
 * @returns {Promise}
 */
function setState(key, value, expireTime) {
  return module.exports.redis.setAsync(key, value).then(() => {
    if (expireTime) return module.exports.redis.expire(key, expireTime);
  });
}

/**
 * Waits an amount of time, then runs the callback
 *
 * @param {Function} cb
 * @param {number} ms
 * @returns {Promise}
 */
function sleepAndRun(cb, ms = 1000) {
  return new Promise(resolve => setTimeout(() => cb().then(resolve), ms));
}

/**
 *
 * @param {string} action
 * @param {Function} cb
 * @returns {Promise}
 */
function applyLock(action, cb) {
  const lockName = `${action}-lock`;

  return getState(action).then(state => {
    /**
     * If it's ONGOING, just re-run this function after a while
     * to see if the state changed.
     */
    if (state === STATE.ONGOING) {
      return sleepAndRun(() => applyLock(action, cb), RETRY_TIME);
    }

    if (!state || state === STATE.RETRY)
      return lockAndExecute(action, lockName, cb)
        .catch(() => retryLocking(action, cb));
  });
}

function lockAndExecute(action, lockName, cb) {
  return setState(action, STATE.ONGOING)
    .then(() => addLock(lockName, LOCK_TTL))
    .then(lock => removeLockWhenReady(lock, lockName, cb))
    .then(() => setState(action, STATE.FINISHED, KEY_TTL));
}

function retryLocking(action, cb) {
  actionRetryCount++;

  if (actionRetryCount >= actionRetryTotal) {
    log('error', `Action "${action}" could not be executed`);
    return setState(action, STATE.FINISHED, KEY_TTL);
  }

  return setState(action, STATE.RETRY)
    .then(() => sleepAndRun(() => applyLock(action, cb), RETRY_TIME));
}

/**
 * Saves both the redis and redlock instance
 * into the module
 *
 * @param {Object} instance Redis instance
 * @returns {Object} Redlock instance
 */
function setupRedlock(instance) {
  if (!instance) return emptyModule;

  const redlock = new Redlock([instance], CONFIG);

  redlock.on('clientError', logGenericError(__filename));

  module.exports.redis = instance;
  module.exports.redlock = redlock;

  return redlock;
}

module.exports.redis = {};
module.exports.redlock;

module.exports.setupRedlock = setupRedlock;
module.exports.applyLock = applyLock;
