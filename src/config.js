export const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
export const REDIS_PORT = process.env.REDIS_PORT || 6379;
export const REDIS_DB = process.env.REDIS_DB || 2;

export const FRIGG_WORKER_TOKEN = process.env.FRIGG_WORKER_TOKEN;

export const VERSIONS = {
  'frigg-worker': process.env.FRIGG_WORKER_VERSION,
  'frigg-settings': process.env.FRIGG_SETTINGS_VERSION,
  'frigg-coverage': process.env.FRIGG_COVERAGE_VERSION,
};

export const STATSD_HOST = process.env.STATSD_HOST;
