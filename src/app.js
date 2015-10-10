import express from 'express';
import bodyParser from 'body-parser';
import errorHandler from 'express-error-middleware';
import config from './config';
import * as routes from './routes';
import {InvalidTokenError, OutdatedWorkerError} from './errors';
import {isVersionValid} from './utils';


process.env.API_ERROR_WRAPPER = process.env.API_ERROR_WRAPPER || 'error';

const app = express();
app.use(bodyParser.json());
app.set('trust proxy', 'loopback');

app.use('/fetch', (req, res, next) => {
  if (req.headers['x-frigg-worker-token'] !== config.FRIGG_WORKER_TOKEN) {
    return next(new InvalidTokenError());
  }

  if (!isVersionValid(req.headers['x-frigg-worker-version'], config.FRIGG_WORKER_VERSION)) {
    return next(new OutdatedWorkerError());
  }

  if (!isVersionValid(req.headers['x-frigg-settings-version'], config.FRIGG_SETTINGS_VERSION)) {
    return next(new OutdatedWorkerError());
  }

  if (!isVersionValid(req.headers['x-frigg-coverage-version'], config.FRIGG_COVERAGE_VERSION)) {
    return next(new OutdatedWorkerError());
  }

  next();
});


app.get('/fetch/:slug', routes.fetch);
app.get('/fetch', routes.fetch);
app.get('/api/stats', routes.stats);
app.post('/webhooks/github', routes.webhooks.github);
app.post('/webhooks/:slug', routes.webhooks.general);
app.get('/*', routes.redirect);

app.use(errorHandler.ApiErrorsMiddleware);

// istanbul ignore next
if (process.NODE_ENV === 'production') {
  const raven = require('raven');
  app.use(raven.middleware.express(process.env.RAVEN_DSN));
}


module.exports = app;
