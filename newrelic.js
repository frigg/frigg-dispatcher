/* eslint-env node */
/* eslint-disable no-var */
var path = require('path');
/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
var secrets = {};
if (process.env.SECRETS_PATH) {
  secrets = require(process.env.SECRETS_PATH);
}

exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['frigg-dispatcher'],
  /**
   * Your New Relic license key.
   */
  license_key: secrets.NEWRELIC_LICENSE,
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'info',
    filepath: path.resolve(__dirname, 'logs/newrelic.log'),
  },
};
