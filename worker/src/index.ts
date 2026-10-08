interface RateLimiter {
    limit(options: {key: string}): Promise<{success: boolean}>;
}

interface Env {
    PLANS: R2Bucket;
    SHARE_LIMITER: RateLimiter;
    ALLOWED_ORIGIN: string;
}

const MIN_SIZE = 29;
const MAX_SIZE = 1024 * 1024;
const ID_LENGTH = 10;
const ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const ID_PATTERN = /^[A-Za-z0-9_-]{10}$/;
const RENEW_AFTER_MS = 24 * 60 * 60 * 1000;

function createId(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(ID_LENGTH));
    return Array.from(bytes, (byte) => ID_ALPHABET[byte & 63]).join('');
}

function respond(env: Env, body: BodyInit | null, status: number, headers: Record<string, string> = {}): Response {
    return new Response(body, {
        status,
        headers: {
            'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'X-Content-Type-Options': 'nosniff',
            ...headers,
        },
    });
}

async function createShare(request: Request, env: Env): Promise<Response> {
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const {success} = await env.SHARE_LIMITER.limit({key: ip});
    if (!success) return respond(env, 'Too many requests', 429);

    if (Number(request.headers.get('Content-Length') ?? 0) > MAX_SIZE) return respond(env, 'Too large', 413);
    const body = await request.arrayBuffer();
    if (body.byteLength < MIN_SIZE || body.byteLength > MAX_SIZE) return respond(env, 'Invalid size', 413);

    const id = createId();
    await env.PLANS.put(id, body, {httpMetadata: {contentType: 'application/octet-stream'}});
    return respond(env, JSON.stringify({id}), 201, {'Content-Type': 'application/json'});
}

async function getShare(id: string, env: Env, ctx: ExecutionContext): Promise<Response> {
    const object = await env.PLANS.get(id);
    if (!object) return respond(env, 'Not found', 404);

    const body = await object.arrayBuffer();
    if (Date.now() - object.uploaded.getTime() > RENEW_AFTER_MS) {
        ctx.waitUntil(env.PLANS.put(id, body.slice(0), {httpMetadata: {contentType: 'application/octet-stream'}}));
    }

    return respond(env, body, 200, {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'no-store',
    });
}

export default {
    async fetch(request, env, ctx): Promise<Response> {
        if (request.method === 'OPTIONS') return respond(env, null, 204);

        const {pathname} = new URL(request.url);
        if (pathname === '/api/share' && request.method === 'POST') return createShare(request, env);

        const id = pathname.match(/^\/api\/share\/([^/]+)$/)?.[1];
        if (id && request.method === 'GET' && ID_PATTERN.test(id)) return getShare(id, env, ctx);

        return respond(env, 'Not found', 404);
    },
} satisfies ExportedHandler<Env>;
