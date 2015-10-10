
import bluebird from 'bluebird';
import redis from 'redis';
import Statsd from 'node-statsd';
const config = require('./config');

const client = bluebird.promisifyAll(redis.createClient(config.REDIS_PORT, config.REDIS_HOST));
const statsd = new Statsd({
  'host': config.STATSD_HOST,
  'prefix': 'dispatcher.',
});

export function fetch(slug, workerHost) {
  statsd.increment('fetch');
  return client.selectAsync(config.REDIS_DB)
    .then(() => {
      return client.set;
    })
    .then(() => {
      return client.hsetAsync('frigg:worker:last_seen', workerHost, new Date().toISOString());
    })
    .then(() => {
      return client.rpopAsync('frigg:queue' + (slug ? ':' + slug + '' : ''));
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