import bluebird from 'bluebird';
import redis from 'redis';
import Statsd from 'node-statsd';

import * as config from './config';
import { createQueueKey, loadJsonValues } from './utils';

const client = bluebird.promisifyAll(redis.createClient(config.REDIS_PORT, config.REDIS_HOST));

let statsd;
if (config.STATSD_HOST) {
  statsd = new Statsd({
    host: config.STATSD_HOST,
    prefix: 'dispatcher.',
  });
}

export function fetch(slug, workerHost, versions) {
  if (statsd) {
    statsd.increment('fetch');
  }
  return client.selectAsync(config.REDIS_DB)
    .then(() => client.set)
    .then(() => [
      client.hsetAsync('frigg:worker:last_seen', workerHost, new Date().toISOString()),
      client.hsetAsync('frigg:worker:versions', workerHost, JSON.stringify(versions)),
    ])
    .then(() => client.rpopAsync(createQueueKey(slug)))
    .then(job => JSON.parse(job));
}

export function length(slug) {
  if (statsd) {
    statsd.increment('length');
  }
  return client.selectAsync(config.REDIS_DB)
    .then(() => client.llenAsync(createQueueKey(slug)));
}

export function stats() {
  return client.selectAsync(config.REDIS_DB)
    .then(() =>
      bluebird.props({
        lastSeen: client.hgetallAsync('frigg:worker:last_seen'),
        versions: client.hgetallAsync('frigg:worker:versions').then(loadJsonValues),
      })
    );
}

export function handleWebhook(service, type, payload) {
  if (statsd) {
    statsd.increment('webhook');
  }
  return client.selectAsync(config.REDIS_DB)
    .then(() =>
      client.lpushAsync('frigg:webhooks', JSON.stringify({
        service,
        type,
        payload,
      }))
    );
}
