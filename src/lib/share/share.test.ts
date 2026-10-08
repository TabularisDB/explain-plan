import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {SAMPLES} from '../../samples';
import {createShortLink, loadPlan, storeLocalPlan} from './share';

const linkHash = (link: string) => link.slice(link.indexOf('#'));

describe('share', () => {
    const store = new Map<string, BodyInit>();

    beforeEach(() => {
        store.clear();
        vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
            if (init?.method === 'POST') {
                const id = `plan${String(store.size).padStart(6, '0')}`;
                store.set(id, init.body!);
                return new Response(JSON.stringify({id}), {status: 201});
            }
            const body = store.get(url.split('/').pop()!);
            return body ? new Response(body) : new Response('Not found', {status: 404});
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('opens a locally stored plan for every sample', async () => {
        for (const {engine, text} of SAMPLES) {
            storeLocalPlan(text, engine);
            const result = await loadPlan('');
            expect(result.status).toBe('ok');
            if (result.status === 'ok') expect(result.plan.driver).toBe(engine);
        }
    });

    it('creates a short link that opens the same plan', async () => {
        for (const {engine, text} of SAMPLES) {
            storeLocalPlan(text, engine);
            const link = await createShortLink();
            expect(link).toMatch(/\/plan#s=[\w-]{10},[\w-]{22}$/);
            const result = await loadPlan(linkHash(link));
            expect(result.status).toBe('ok');
            if (result.status === 'ok') expect(result.plan.driver).toBe(engine);
        }
    });

    it('never sends the plan or the key to the server', async () => {
        storeLocalPlan(SAMPLES[0].text, SAMPLES[0].engine);
        const link = await createShortLink();
        const [body] = [...store.values()];
        const sent = new TextDecoder().decode(body as Uint8Array);
        expect(sent).not.toContain('Hash Join');
        expect(sent).not.toContain(link.split(',')[1]);
    });

    it('keeps the plan in memory when sessionStorage is unavailable', async () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new DOMException('QuotaExceededError');
        });
        storeLocalPlan(SAMPLES[0].text, SAMPLES[0].engine);
        sessionStorage.clear();
        expect((await loadPlan('')).status).toBe('ok');
        vi.restoreAllMocks();
    });

    it('reports an expired link', async () => {
        expect((await loadPlan('#s=plan999999,AAAAAAAAAAAAAAAAAAAAAA')).status).toBe('missing');
    });

    it('reports a link with the wrong key or a missing part', async () => {
        storeLocalPlan(SAMPLES[0].text, SAMPLES[0].engine);
        const link = await createShortLink();
        expect((await loadPlan(linkHash(link).replace(/,.*/, ',AAAAAAAAAAAAAAAAAAAAAA'))).status).toBe('invalid');
        expect((await loadPlan('#s=plan000000')).status).toBe('invalid');
    });

    it('reports a network error', async () => {
        vi.stubGlobal('fetch', async () => {
            throw new TypeError('Failed to fetch');
        });
        expect((await loadPlan('#s=plan000000,AAAAAAAAAAAAAAAAAAAAAA')).status).toBe('failed');
    });
});
