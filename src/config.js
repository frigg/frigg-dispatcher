let secrets = {};

if (process.env.SECRETS_PATH) {
  secrets = require(process.env.SECRETS_PATH);
}

export const REDIS_HOST = secrets.REDIS_HOST || '127.0.0.1';
export const REDIS_PORT = secrets.REDIS_PORT || 6379;
export const REDIS_DB = secrets.REDIS_DB || 2;

export const RAVEN_DSN = secrets.RAVEN_DSN || 2;

export const STATSD_HOST = secrets.STATSD_HOST;

export const FRIGG_WORKER_TOKEN = secrets.FRIGG_WORKER_TOKEN;

export const VERSIONS = {
  'frigg-worker': secrets.FRIGG_WORKER_VERSION,
  'frigg-settings': secrets.FRIGG_SETTINGS_VERSION,
  'frigg-coverage': secrets.FRIGG_COVERAGE_VERSION,
};
