import _ from 'lodash';
import redis from 'redis';
import semver from 'semver';
import bluebird from 'bluebird';
import * as config from './config';

const client = bluebird.promisifyAll(redis.createClient(config.REDIS_PORT, config.REDIS_HOST));

export function isVersionValid(version, requirement) {
  if (!requirement) {
    return true;
  }
  return !!version && semver.satisfies(version, requirement);
}

export function readVersion(req, slug) {
  const version = {
    current: req.headers['x-' + slug + '-version'],
    requirement: config.VERSIONS[slug],
  };
  version.isValid = isVersionValid(version.current, version.requirement);
  return version;
}

export function createQueueKey(slug) {
  return 'frigg:queue' + (slug ? ':' + slug + '' : '');
}

export function loadJsonValues(obj) {
  _.forOwn(obj, (value, key) => {
    obj[key] = JSON.parse(value);
  });
  return obj;
}

export function loadTokens() {
  return client.selectAsync(2)
    .then(() => {
      return client.lrangeAsync('frigg:dispatcher_tokens', 0, -1);
    })
    .then(tokens => {
      return _.union(tokens, [config.FRIGG_WORKER_TOKEN]);
    });
}
