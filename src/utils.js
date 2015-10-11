import semver from 'semver';

import * as config from './config';

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
