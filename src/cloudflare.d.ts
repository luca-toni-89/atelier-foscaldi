interface D1Result<T=unknown>{results:T[];meta:{changes:number}}
interface D1PreparedStatement{bind(...v:unknown[]):D1PreparedStatement;first<T=unknown>():Promise<T|null>;all<T=unknown>():Promise<D1Result<T>>;run():Promise<D1Result>}
interface D1Database{prepare(q:string):D1PreparedStatement;batch(s:D1PreparedStatement[]):Promise<D1Result[]>}
interface R2ObjectBody{body:ReadableStream;httpEtag:string} interface R2Bucket{get(k:string):Promise<R2ObjectBody|null>;put(k:string,v:ArrayBuffer,o?:unknown):Promise<unknown>;delete(k:string):Promise<void>}
interface Fetcher{fetch(r:Request):Promise<Response>}
interface ExportedHandler<E>{fetch(r:Request,e:E):Promise<Response>}
