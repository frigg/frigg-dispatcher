export class InvalidTokenError extends Error {
  constructor() {
    super();

    this.name = 'InvalidTokenError';
    this.code = 'TOKEN';
    this.message = 'Invalid token';
    this.status = 403;
  }
}

export class OutdatedWorkerError extends Error {
  constructor() {
    super();

    this.name = 'OutdatedWorkerError';
    this.code = 'OUTDATED';
    this.message = 'The worker is outdated. Please update.';
    this.status = 400;
  }
}
