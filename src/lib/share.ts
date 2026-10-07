import * as pako from 'pako';
import {encode, decode} from '@msgpack/msgpack';
import type {ExplainPlan} from '@tabularis/explain';
import {parsePlan, type EngineChoice} from './parse';

// On utilise des clés ultra-courtes ('r' et 'e') pour gagner chaque octet possible
interface CompressedPlan {
    r: string;
    e: EngineChoice;
}

export function encodePlan(raw: string, engine: EngineChoice): string {
    const payload: CompressedPlan = {r: raw, e: engine};

    // 1. Encodage MessagePack (binaire, beaucoup plus compact que JSON.stringify)
    const msgPackBuffer = encode(payload);

    // 2. Compression Deflate maximale (level 9) sans en-tête zlib (deflateRaw)
    const compressedUint8 = pako.deflateRaw(msgPackBuffer, {level: 9});

    // 3. Conversion Base64 URL Safe avec boucle (évite le crash Call Stack sur les gros plans)
    let binaryString = '';
    for (let i = 0; i < compressedUint8.length; i++) {
        binaryString += String.fromCharCode(compressedUint8[i]);
    }

    const base64UrlSafe = btoa(binaryString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    return base64UrlSafe;
}

function decompressFromEncodedURIComponent(encoded: string): Uint8Array | null {
    if (!encoded) return null;
    try {
        let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }

        const binaryString = atob(base64);
        const uint8Array = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
        }

        // Décompression inverse obligatoire (inflateRaw)
        return pako.inflateRaw(uint8Array);
    } catch (error) {
        console.error("Erreur lors de la décompression du composant d'URL", error);
        return null;
    }
}

export function planFromHash(hash: string): ExplainPlan | null {
    const data = new URLSearchParams(hash.replace(/^#/, '')).get('p');
    if (!data) return null;

    try {
        const decompressedBuffer = decompressFromEncodedURIComponent(data);
        if (!decompressedBuffer) return null;

        // 4. Décodage MessagePack pour retrouver notre objet
        const {r: raw, e: engine} = decode(decompressedBuffer) as CompressedPlan;

        return parsePlan(raw, engine ?? 'auto');
    } catch (error) {
        console.error('Erreur de parsing du plan', error);
        return null;
    }
}
