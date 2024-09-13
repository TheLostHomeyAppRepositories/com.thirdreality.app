'use strict';

const { debug } = require('zigbee-clusters');


function wrapAsyncWithRetry(
  method,
  times = 1,
  interval = 0,
) {
  if (typeof method !== 'function') throw TypeError('expected_function');
  if (typeof times !== 'number') throw TypeError('expected_times_number');
  if (typeof interval !== 'number' && typeof interval !== 'function') {
    throw TypeError('expected_interval_number_or_function');
  }
  return new Promise((resolve, reject) => {
    let retries = 0;

    // Create function which executes the provided method and resolves the promise if success,
    // if failure it will wait for the provided interval and then execute the method again.
    function executeMethod() {
      method()
        .then(resolve)
        .catch(err => {
          if (times > retries) {
            retries += 1;

            // Determine time to wait
            const waitTime = typeof interval === 'function' ? interval(retries) : interval;
            return wait(waitTime).then(executeMethod);
          }
          return reject(err);
        });
    }

    // Start the execution
    executeMethod();
  });
}



/**
 * Utility class with several color and range conversion methods.
 * @class Util
 */
module.exports = {
  wrapAsyncWithRetry
};