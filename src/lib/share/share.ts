import type {ExplainPlan} from '@tabularis/explain';
import * as pako from 'pako';
import type {Engine} from '../engines/engines';
import {compactPlan, formatPlan} from '../format/format';
import {SHARE_WORKER_URL} from '../links/links';
import {isEngine, parsePlan} from '../parse/parse';

const PAYLOAD_VERSION = 1;
const IV_LENGTH = 12;
const SHARE_API = import.meta.env.DEV ? '' : SHARE_WORKER_URL;
const SESSION_KEY = 'explain-plan:current';

interface Payload {
    v: number;
    raw: string;
    engine: Engine;
}

export type PlanResult = {status: 'ok'; plan: ExplainPlan} | {status: 'empty' | 'invalid' | 'missing' | 'failed'};

let fallbackPayload: Uint8Array<ArrayBuffer> | null = null;

function toBase64Url(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function packPlan(raw: string, engine: Engine): Uint8Array<ArrayBuffer> {
    const payload: Payload = {v: PAYLOAD_VERSION, raw: compactPlan(raw), engine};
    return new Uint8Array(pako.deflateRaw(JSON.stringify(payload), {level: 9}));
}

function unpackPlan(bytes: Uint8Array): ExplainPlan | null {
    try {
        const payload = JSON.parse(pako.inflateRaw(bytes, {toText: true})) as Payload;
        if (payload.v !== PAYLOAD_VERSION || !isEngine(payload.engine)) return null;
        return parsePlan(formatPlan(payload.raw), payload.engine);
    } catch {
        return null;
    }
}

export function storeLocalPlan(raw: string, engine: Engine) {
    const payload = packPlan(raw, engine);
    try {
        sessionStorage.setItem(SESSION_KEY, toBase64Url(payload));
        fallbackPayload = null;
    } catch {
        fallbackPayload = payload;
    }
}

function localPayload(): Uint8Array<ArrayBuffer> | null {
    try {
        const stored = sessionStorage.getItem(SESSION_KEY);
        return stored ? fromBase64Url(stored) : fallbackPayload;
    } catch {
        return fallbackPayload;
    }
}

export async function createShareLink(): Promise<string> {
    const payload = localPayload();
    if (!payload) throw new Error('No plan to share');

    const key = await crypto.subtle.generateKey({name: 'AES-GCM', length: 128}, true, ['encrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const ciphertext = new Uint8Array(await crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, payload));
    const body = new Uint8Array(IV_LENGTH + ciphertext.length);
    body.set(iv);
    body.set(ciphertext, IV_LENGTH);

    const response = await fetch(`${SHARE_API}/api/share`, {
        method: 'POST',
        headers: {'Content-Type': 'application/octet-stream'},
        body,
    });
    if (!response.ok) throw new Error(`Share request failed with status ${response.status}`);

    const {id} = (await response.json()) as {id: string};
    const rawKey = new Uint8Array(await crypto.subtle.exportKey('raw', key));
    return `${window.location.origin}/plan#s=${id},${toBase64Url(rawKey)}`;
}

async function loadShareLink(id: string, key: string): Promise<PlanResult> {
    let response: Response;
    try {
        response = await fetch(`${SHARE_API}/api/share/${encodeURIComponent(id)}`);
    } catch {
        return {status: 'failed'};
    }
    if (response.status === 404) return {status: 'missing'};
    if (!response.ok) return {status: 'failed'};

    try {
        const body = new Uint8Array(await response.arrayBuffer());
        const cryptoKey = await crypto.subtle.importKey('raw', fromBase64Url(key), 'AES-GCM', false, ['decrypt']);
        const payload = new Uint8Array(
            await crypto.subtle.decrypt(
                {name: 'AES-GCM', iv: body.subarray(0, IV_LENGTH)},
                cryptoKey,
                body.subarray(IV_LENGTH),
            ),
        );
        const plan = unpackPlan(payload);
        return plan ? {status: 'ok', plan} : {status: 'invalid'};
    } catch {
        return {status: 'invalid'};
    }
}

export async function loadPlan(hash: string): Promise<PlanResult> {
    const shared = new URLSearchParams(hash.replace(/^#/, '')).get('s');
    if (shared === null) {
        const payload = localPayload();
        const plan = payload && unpackPlan(payload);
        return plan ? {status: 'ok', plan} : {status: 'empty'};
    }

    const [id, key] = shared.split(',');
    if (!id || !key) return {status: 'invalid'};
    return loadShareLink(id, key);
}
