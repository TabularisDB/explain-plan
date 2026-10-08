import {describe, expect, it} from 'vitest';
import {SAMPLES} from '../../samples';
import SQLSERVER_TRIVIAL_SCAN from '../../test/fixtures/sqlserver-trivial-scan.xml?raw';
import {parsePlan} from '../parse/parse';
import {compactPlan, formatPlan, highlightPlan, prettifyJson, prettifyXml} from './format';

const sample = (engine: string) => SAMPLES.find((candidate) => candidate.engine === engine)!.text;

describe('prettifyJson', () => {
    it('pretty-prints a compact JSON object', () => {
        expect(prettifyJson('{"query_block":{"select_id":1}}')).toBe(
            '{\n    "query_block": {\n        "select_id": 1\n    }\n}',
        );
    });

    it('pretty-prints a compact JSON array', () => {
        expect(prettifyJson('[{"Plan":{"Node Type":"Seq Scan"}}]')).toBe(
            '[\n    {\n        "Plan": {\n            "Node Type": "Seq Scan"\n        }\n    }\n]',
        );
    });

    it('leaves plain-text plans alone', () => {
        expect(prettifyJson('Seq Scan on users  (cost=0.00..155.00)')).toBeNull();
        expect(prettifyJson(sample('sqlite'))).toBeNull();
    });

    it('leaves invalid JSON alone', () => {
        expect(prettifyJson('{"query_block": broken')).toBeNull();
    });

    it('leaves already-formatted JSON alone', () => {
        expect(prettifyJson('{\n    "a": 1\n}')).toBeNull();
    });
});

describe('prettifyXml', () => {
    it('indents nested elements and keeps text-only elements inline', () => {
        expect(prettifyXml('<?xml version="1.0"?><A x="1"><B/><C>text</C><D><E y="2"/></D></A>')).toBe(
            [
                '<?xml version="1.0"?>',
                '<A x="1">',
                '    <B/>',
                '    <C>text</C>',
                '    <D>',
                '        <E y="2"/>',
                '    </D>',
                '</A>',
            ].join('\n'),
        );
    });

    it('formats a single-line SHOWPLAN and keeps it parseable', () => {
        const formatted = prettifyXml(SQLSERVER_TRIVIAL_SCAN);
        expect(formatted).not.toBeNull();
        expect(formatted!.split('\n').length).toBeGreaterThan(10);
        expect(parsePlan(formatted!, 'sqlserver').root).toEqual(parsePlan(SQLSERVER_TRIVIAL_SCAN, 'sqlserver').root);
    });

    it('leaves non-XML and unbalanced markup alone', () => {
        expect(prettifyXml('Seq Scan on users  (cost=0.00..155.00)')).toBeNull();
        expect(prettifyXml('{"query_block":{"select_id":1}}')).toBeNull();
        expect(prettifyXml('<A><B></A>')).toBeNull();
        expect(prettifyXml('<A><B>')).toBeNull();
    });

    it('leaves already-formatted XML alone', () => {
        expect(prettifyXml('<A>\n    <B/>\n</A>')).toBeNull();
    });
});

describe('formatPlan and compactPlan', () => {
    it('formats JSON and XML, and leaves text plans unchanged', () => {
        expect(formatPlan('{"a":1}')).toBe('{\n    "a": 1\n}');
        expect(formatPlan('<A><B/></A>')).toBe('<A>\n    <B/>\n</A>');
        expect(formatPlan(sample('postgres'))).toBe(sample('postgres'));
    });

    it('removes the indentation that formatPlan adds', () => {
        for (const engine of ['mysql', 'sqlserver', 'oracle'] as const) {
            const text = sample(engine);
            expect(parsePlan(compactPlan(formatPlan(text)), engine).root).toEqual(parsePlan(text, engine).root);
        }
    });

    it('keeps text plans as they are, since their indentation is part of the tree', () => {
        expect(compactPlan(sample('postgres'))).toBe(sample('postgres'));
        expect(compactPlan(sample('sqlite'))).toBe(sample('sqlite'));
    });
});

describe('highlightPlan', () => {
    it('escapes text plans so they can be inserted as HTML', () => {
        expect(highlightPlan('a < b && c')).toBe('a &lt; b &amp;&amp; c');
    });

    it('wraps JSON tokens in Prism spans', () => {
        expect(highlightPlan('{"a": 1}')).toContain('class="token');
    });
});
