export interface StringMap {
  [key: string]: any;
}

export interface PagingOptions {
  limit?: number;
  start?: number;
}

export class UserError extends Error {
  public constructor(message: string) {
    super(message);
  }
}
