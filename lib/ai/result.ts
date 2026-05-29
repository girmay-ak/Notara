/**
 * Discriminated-union result type used across the AI pipeline (and the rest of
 * the app). Never throw across a server-action / route-handler boundary — return
 * one of these. `code` is a stable machine string; the client maps it to copy.
 */
export type Ok<T> = { ok: true; data: T };
export type Err = { ok: false; error: { code: string; message: string } };
export type Result<T> = Ok<T> | Err;

export const ok = <T>(data: T): Ok<T> => ({ ok: true, data });
export const err = (code: string, message: string): Err => ({
  ok: false,
  error: { code, message },
});
