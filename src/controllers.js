import bluebird from 'bluebird';
import redis from 'redis';
import Statsd from 'node-statsd';

import * as config from './config';
import {createQueueKey} from './utils';

const client = bluebird.promisifyAll(redis.createClient(config.REDIS_PORT, config.REDIS_HOST));
const statsd = new Statsd({
  'host': config.STATSD_HOST,
  'prefix': 'dispatcher.',
});

export function fetch(slug, workerHost, versions) {
  statsd.increment('fetch');
  return client.selectAsync(config.REDIS_DB)
    .then(() => {
      return client.set;
    })
    .then(() => {
      return [
        client.hsetAsync('frigg:worker:last_seen', workerHost, new Date().toISOString()),
        client.hsetAsync('frigg:worker:version', workerHost, JSON.stringify(versions)),
      ];
    })
    .then(() => {
      return client.rpopAsync(createQueueKey(slug));
    })
    .then(job => {
      return JSON.parse(job);
    });
}

export function stats() {
  return client.selectAsync(config.REDIS_DB)
    .then(() => {
      return bluebird.props({
        lastSeen: client.hgetallAsync('frigg:worker:last_seen'),
      });
    });
}

export function handleWebhook(service, type, payload) {
  statsd.increment('webhook');
  return client.selectAsync(config.REDIS_DB)
    .then(() => {
      return client.lpushAsync('frigg:webhooks', JSON.stringify({
        'service': service,
        'type': type,
        'payload': payload,
      }));
    });
}
