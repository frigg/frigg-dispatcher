export default {
  'REDIS_HOST': process.env.REDIS_HOST || '127.0.0.1',
  'REDIS_PORT': process.env.REDIS_PORT || 6379,
  'REDIS_DB': process.env.REDIS_DB || 2,
  'FRIGG_WORKER_TOKEN': process.env.FRIGG_WORKER_TOKEN,
  'VERSIONS': {
    'frigg-worker': process.env.FRIGG_WORKER_VERSION,
    'frigg-settings': process.env.FRIGG_SETTINGS_VERSION,
    'frigg-coverage': process.env.FRIGG_COVERAGE_VERSION,
  },
  'STATSD_HOST': process.env.STATSD_HOST,
};
