/* eslint-env mocha */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import supertest from 'supertest';
import redis from 'redis';
import bluebird from 'bluebird';

import {getBody} from './test-helpers';

import app from '../src/app';
import * as config from '../src/config';

chai.use(chaiAsPromised);

const expect = chai.expect;

const client = bluebird.promisifyAll(redis.createClient());
const request = bluebird.promisifyAll(supertest);


describe('Express server', () => {
  const outdated = {
    code: 'OUTDATED',
    error: 'OutdatedWorkerError',
    message: 'The worker is outdated. Please update.',
  };

  beforeEach(() => {
    config.FRIGG_WORKER_TOKEN = 'token';
    config.VERSIONS = {
      'frigg-worker': null,
      'frigg-settings': null,
      'frigg-coverage': null,
    };

    return client.selectAsync(2).then(() => {
      return bluebird.all([
        client.delAsync('frigg:queue'),
        client.delAsync('frigg:queue:custom'),
        client.delAsync('frigg:webhooks'),
        client.delAsync('frigg:worker:last_seen'),
        client.delAsync('frigg:worker:version'),
      ]);
    });
  });

  describe('/*', () => {
    it('should redirect to frigg.io', () => {
      return request(app)
        .get('/')
        .expectAsync(302);
    });
  });

  describe('/fetch', () => {
    it('should return 403 without token', () => {
      return request(app)
        .get('/fetch')
        .expectAsync(403);
    });

    it('should return 200 if there is no job', () => {
      return request(app)
      .get('/fetch')
      .set('x-frigg-worker-token', 'token')
      .expectAsync(200);
    });

    it('should return null if there is no job', () => {
      const response = request(app)
        .get('/fetch')
        .set('x-frigg-worker-token', 'token')
        .endAsync()
        .then(getBody);

      return expect(response).to.eventually.deep.equal({job: null});
    });

    it('should log last fetch', () => {
      return request(app)
        .get('/fetch')
        .set('x-frigg-worker-token', 'token')
        .set('x-frigg-worker-host', 'ron')
        .endAsync()
        .then(() => {
          return client.selectAsync(2);
        })
        .then(() => {
          return client.hgetallAsync('frigg:worker:last_seen');
        })
        .then(res => {
          expect(res).to.contain.key('ron');
        });
    });

    it('should log last fetch when host is not set', () => {
      return request(app)
        .get('/fetch')
        .set('x-frigg-worker-token', 'token')
        .endAsync()
        .then(() => {
          return client.selectAsync(2);
        })
        .then(() => {
          return client.hgetallAsync('frigg:worker:last_seen');
        })
        .then(res => {
          expect(res).to.contain.key('::ffff:127.0.0.1');
        });
    });

    it('should allow access from new worker if the requirement allows it', () => {
      config.VERSIONS['frigg-worker'] = '>=1.0.0';
      const response = request(app)
        .get('/fetch')
        .set('x-frigg-worker-token', 'token')
        .set('x-frigg-worker-version', '1.5.0')
        .expect(200)
        .endAsync()
        .then(getBody);

      return expect(response).to.eventually.deep.equal({job: null});
    });

    it('should deny access from old worker (worker)', () => {
      config.VERSIONS['frigg-worker'] = '1.0.0';
      const response = request(app)
        .get('/fetch')
        .set('x-frigg-worker-token', 'token')
        .expect(400).endAsync()
        .then(getBody);

      return expect(response).to.eventually.deep.equal({error: outdated});
    });

    it('should deny access from old worker (settings)', () => {
      config.VERSIONS['frigg-settings'] = '1.0.0';
      const response = request(app)
        .get('/fetch')
        .set('x-frigg-worker-token', 'token')
        .expect(400)
        .endAsync()
        .then(getBody);

      return expect(response).to.eventually.deep.equal({error: outdated});
    });

    it('should deny access from old worker (coverage)', () => {
      config.VERSIONS['frigg-coverage'] = '1.0.0';
      const response = request(app)
        .get('/fetch')
        .set('x-frigg-worker-token', 'token')
        .expect(400)
        .endAsync()
        .then(getBody);

      return expect(response).to.eventually.deep.equal({error: outdated});
    });

    it('should return job', () => {
      const jobObj = {
        'branch': 'master',
        'clone_url': 'url',
      };
      const response = client.selectAsync(2)
        .then(() => {
          return client.lpushAsync('frigg:queue', JSON.stringify(jobObj));
        })
        .then(() => {
          return request(app)
          .get('/fetch')
          .set('x-frigg-worker-token', 'token')
          .expect(200)
          .endAsync();
        })
        .then(getBody);

      return expect(response).to.eventually.deep.equal({job: jobObj});
    });

    it('should return job from custom queue', () => {
      const jobObj = {
        'branch': 'master',
        'clone_url': 'url-custom',
      };
      const response = client.selectAsync(2)
        .then(() => {
          return client.lpushAsync('frigg:queue:custom', JSON.stringify(jobObj));
        })
        .then(() => {
          return request(app)
            .get('/fetch/custom')
            .set('x-frigg-worker-token', 'token')
            .expect(200)
            .endAsync();
        })
        .then(getBody);

      return expect(response).to.eventually.deep.equal({job: jobObj});
    });
  });

  describe('/length/:slug', () => {
    beforeEach(() => {
      return client.selectAsync(2)
        .then(() => {
          return [
            client.lpushAsync('frigg:queue', ''),
            client.lpushAsync('frigg:queue', ''),
            client.lpushAsync('frigg:queue:custom', ''),
          ];
        });
    });

    it('should return length of frigg:queue with no slug', () => {
      const response = request(app)
        .get('/length')
        .expect(200)
        .endAsync()
        .then(getBody);

      return expect(response).to.eventually.deep.equal({length: 2});
    });

    it('should return length of frigg:queue:slug with slug', () => {
      const response = request(app)
        .get('/length/custom')
        .expect(200)
        .endAsync()
        .then(getBody);

      return expect(response).to.eventually.deep.equal({length: 1});
    });
  });

  describe('/webhooks/:slug', () => {
    it('should return 202', () => {
      return request(app)
        .post('/webhooks/cvs')
        .expectAsync(202);
    });
    it('should put payload on redis queue', () => {
      const payload = {
        'ref': 'refs/heads/master',
        'after': 'ba6854eb994c433b48a3be20fc04cae93d6929a6',
      };

      return request(app)
        .post('/webhooks/cvs')
        .set('X-Github-Event', 'push')
        .send(payload).expect(202)
        .endAsync()
        .then(() => {
          return client.selectAsync(2);
        })
        .then(() => {
          return client.lrangeAsync('frigg:webhooks', 0, -1);
        })
        .then(queue => {
          expect(queue.length).to.equal(1);
          const item = JSON.parse(queue[0]);
          expect(item.service).to.equal('cvs');
          expect(item.payload).to.eql(payload);
        });
    });
  });

  describe('/webhooks/github', () => {
    it('should return 202', () => {
      return request(app).post('/webhooks/github').expectAsync(202);
    });

    it('should put payload on redis queue', () => {
      const payload = {
        'ref': 'refs/heads/master',
        'after': 'ba6854eb994c433b48a3be20fc04cae93d6929a6',
      };

      return request(app)
        .post('/webhooks/github')
        .set('X-Github-Event', 'push')
        .send(payload)
        .expect(202)
        .endAsync()
        .then(() => {
          return client.selectAsync(2);
        })
        .then(() => {
          return client.lrangeAsync('frigg:webhooks', 0, -1);
        })
        .then(queue => {
          expect(queue.length).to.equal(1);
          const item = JSON.parse(queue[0]);
          expect(item.service).to.equal('github');
          expect(item.type).to.equal('push');
          expect(item.payload).to.eql(payload);
        });
    });
  });
});
