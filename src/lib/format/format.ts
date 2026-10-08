import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';

const INDENT = '    ';
const MAX_TAG_LENGTH = 100;

const isJson = (text: string) => /^\s*[{[]/.test(text);
const isXml = (text: string) => /^\s*</.test(text);

export function prettifyJson(text: string): string | null {
    const trimmed = text.trim();
    if (!isJson(trimmed)) return null;
    try {
        const formatted = JSON.stringify(JSON.parse(trimmed), null, INDENT.length);
        return formatted === trimmed ? null : formatted;
    } catch {
        return null;
    }
}

function formatTag(tag: string, indent: string): string {
    if (indent.length + tag.length <= MAX_TAG_LENGTH) {
        return indent + tag;
    }

    const match = tag.match(/^<([^\s/>]+)([\s\S]*?)(\/?)>$/);
    if (!match) {
        return indent + tag;
    }

    const [, name, rawAttrs, selfClosing] = match;
    const attrs = rawAttrs.match(/[^\s=]+\s*=\s*("[^"]*"|'[^']*')/g);
    if (!attrs || attrs.length < 2) {
        return indent + tag;
    }

    return [
        `${indent}<${name}`,
        ...attrs.map((attr) => indent + INDENT + attr.replace(/\s*=\s*/, '=')),
        `${indent}${selfClosing ? '/>' : '>'}`,
    ].join('\n');
}

function toSelfClosing(tag: string): string {
    return tag.slice(0, -1).trimEnd() + ' />';
}

export function prettifyXml(text: string): string | null {
    const trimmed = text.trim();
    if (!isXml(trimmed)) return null;

    const tokens = trimmed.match(/<!\[CDATA\[[\s\S]*?\]\]>|<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<![^>]*>|<[^>]+>|[^<]+/g);
    if (!tokens) return null;

    const lines: string[] = [];
    const stack: string[] = [];
    let depth = 0;
    const indent = () => INDENT.repeat(depth);

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (!token.startsWith('<')) {
            const content = token.trim();
            if (content !== '') lines.push(indent() + content);
            continue;
        }

        if (token.startsWith('</')) {
            const name = token.slice(2, -1).trim();
            if (stack.pop() !== name) return null;
            depth--;
            lines.push(indent() + token);
            continue;
        }

        if (/^<[!?]/.test(token)) {
            lines.push(indent() + token);
            continue;
        }

        if (token.endsWith('/>')) {
            lines.push(formatTag(token, indent()));
            continue;
        }

        const name = token.slice(1, -1).trim().split(/\s/, 1)[0];
        const next = tokens[i + 1];
        const afterNext = tokens[i + 2];

        if (next === `</${name}>`) {
            lines.push(formatTag(toSelfClosing(token), indent()));
            i += 1;
            continue;
        }

        if (next !== undefined && !next.startsWith('<') && afterNext === `</${name}>`) {
            const content = next.trim();
            lines.push(
                content === '' ? formatTag(toSelfClosing(token), indent()) : indent() + token + content + afterNext,
            );
            i += 2;
            continue;
        }

        lines.push(formatTag(token, indent()));
        stack.push(name);
        depth++;
    }

    if (stack.length > 0) return null;

    const formatted = lines.join('\n');
    return formatted === trimmed ? null : formatted;
}

export function formatPlan(text: string): string {
    return prettifyJson(text) ?? prettifyXml(text) ?? text;
}

export function compactPlan(text: string): string {
    const trimmed = text.trim();
    if (isJson(trimmed)) {
        try {
            return JSON.stringify(JSON.parse(trimmed));
        } catch {
            return text;
        }
    }
    if (isXml(trimmed)) return trimmed.replace(/>\s+</g, '><');
    return text;
}

export function highlightPlan(code: string): string {
    if (isJson(code)) return Prism.highlight(code, Prism.languages.json, 'json');
    if (isXml(code)) return Prism.highlight(code, Prism.languages.markup, 'markup');
    return code.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}
