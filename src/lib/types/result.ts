
export type ErrorResult = { ok: false; error?: Error }
export type SuccessResult<T> = { ok: true; data: T }

export type Result<T> = ErrorResult | SuccessResult<T>
