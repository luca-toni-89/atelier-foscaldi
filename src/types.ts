export interface Env { DB:D1Database; IMAGES:R2Bucket; ASSETS:Fetcher; ADMIN_PASSWORD_HASH:string; SESSION_SECRET:string }
export type Status='available'|'reserved'|'sold'; export type Visibility='draft'|'published';
