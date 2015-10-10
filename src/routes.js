import * as controllers from './controllers';

export function fetch(req, res, next) {
  controllers.fetch(req.params.slug, req.headers['x-frigg-worker-host'] || req.ip)
    .then(job => {
      return res.json({
        job: job,
      });
    })
    .catch(next);
}

export function stats(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  controllers.stats()
    .then(_stats => {
      return res.json({
        stats: _stats,
      });
    })
    .catch(next);
}

export function redirect(req, res) {
  return res.redirect('http://frigg.io');
}

export const webhooks = {
  github: function github(req, res, next) {
    const event = req.headers['x-github-event'];
    return controllers.handleWebhook('github', event, req.body)
      .then(() => {
        res.status(202).send('"' + event + '"-event put on queue, it will be handled eventually');
      })
      .catch(next);
  },

  general: function general(req, res, next) {
    return controllers.handleWebhook(req.params.slug, null, req.body)
      .then(() => {
        res.status(202).send('event put on "' + req.params.slug + '"-queue, it will be handled eventually');
      })
      .catch(next);
  },
};
