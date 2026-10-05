import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import {prettifyJson, prettifyXml} from './parse';

export function formatPlan(text: string): string {
    return prettifyJson(text) ?? prettifyXml(text) ?? text;
}

export function highlightPlan(code: string): string {
    if (/^\s*[{[]/.test(code)) return Prism.highlight(code, Prism.languages.json, 'json');
    if (/^\s*</.test(code)) return Prism.highlight(code, Prism.languages.markup, 'markup');
    return code.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}
