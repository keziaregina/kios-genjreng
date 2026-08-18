/** Return shape of every Server Action so forms can render errors the same way. */
export type ActionResult = { ok: true } | { ok: false; message: string };
