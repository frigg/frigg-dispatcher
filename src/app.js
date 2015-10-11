import express from 'express';
import bodyParser from 'body-parser';
import errorHandler from 'express-error-middleware';
import * as routes from './routes';
import * as middlewares from './middlewares';

process.env.API_ERROR_WRAPPER = process.env.API_ERROR_WRAPPER || 'error';

const app = express();
app.use(bodyParser.json());
app.set('trust proxy', 'loopback');

app.use('/fetch', middlewares.versions);
app.use('/fetch', middlewares.requireToken);
app.use('/fetch', middlewares.requireUpdatedPackages);

app.get('/fetch/:slug', routes.fetch);
app.get('/fetch', routes.fetch);
app.get('/length/:slug', routes.length);
app.get('/length', routes.length);
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
