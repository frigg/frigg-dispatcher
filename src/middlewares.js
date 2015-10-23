import _ from 'lodash';

import {InvalidTokenError, OutdatedWorkerError} from './errors';
import {readVersion, loadTokens} from './utils';


export function requireToken(req, res, next) {
  loadTokens()
    .then(tokens => {
      if (tokens.length > 0 && !_.includes(tokens, req.headers['x-frigg-worker-token'])) {
        return next(new InvalidTokenError());
      }
      next();
    });
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
