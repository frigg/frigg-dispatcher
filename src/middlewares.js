import _ from 'lodash';

import * as config from './config';
import {InvalidTokenError, OutdatedWorkerError} from './errors';
import {readVersion} from './utils';


export function requireToken(req, res, next) {
  if (req.headers['x-frigg-worker-token'] !== config.FRIGG_WORKER_TOKEN) {
    return next(new InvalidTokenError());
  }
  next();
}

export function requireUpdatedPackages(req, res, next) {
  _.forOwn(req.versions, (value) => {
    if (!value.isValid) {
      return next(new OutdatedWorkerError());
    }
  });
  next();
}

export function versions(req, res, next) {
  req.versions = {
    worker: readVersion(req, 'frigg-worker'),
    settings: readVersion(req, 'frigg-settings'),
    coverage: readVersion(req, 'frigg-coverage'),
  };
  next();
}
