import semver from 'semver';

export function isVersionValid(version, requirement) {
  if (!requirement) {
    return true;
  }
  return version && semver.satisfies(version, requirement);
}
