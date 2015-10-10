

export function OutdatedWorkerError() {
    /* istanbul ignore next */
  if ((typeof window !== 'undefined' && this === window) || (typeof self !== 'undefined' && this === self)) {
    throw new TypeError("Tried to call class OutdatedWorkerError as a regular function. Classes can only be called with the 'new' keyword.");
  }
}
OutdatedWorkerError.prototype = Object.create(Error.prototype);
OutdatedWorkerError.prototype.constructor = OutdatedWorkerError;
OutdatedWorkerError.prototype.name = 'OutdatedWorkerError';
OutdatedWorkerError.prototype.code = 'OUTDATED';
OutdatedWorkerError.prototype.message = 'The worker is outdated. Please update.';
OutdatedWorkerError.prototype.status = 400;
