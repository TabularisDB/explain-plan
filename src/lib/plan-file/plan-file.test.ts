import {ErrorCode} from 'react-dropzone';
import {describe, expect, it} from 'vitest';
import {planFileErrorMessage, readPlanFile} from './plan-file';

const fileOf = (bytes: number[]) => ({arrayBuffer: async () => new Uint8Array(bytes).buffer}) as unknown as File;

const utf16 = (text: string, littleEndian: boolean) => {
    const bytes = littleEndian ? [0xff, 0xfe] : [0xfe, 0xff];
    for (const char of text) {
        const code = char.charCodeAt(0);
        bytes.push(...(littleEndian ? [code & 0xff, code >> 8] : [code >> 8, code & 0xff]));
    }
    return bytes;
};

describe('readPlanFile', () => {
    it('reads UTF-8 files', async () => {
        expect(await readPlanFile(fileOf([...new TextEncoder().encode('Seq Scan é')]))).toBe('Seq Scan é');
    });

    it('reads UTF-16 files saved by SQL Server Management Studio', async () => {
        expect(await readPlanFile(fileOf(utf16('<ShowPlanXML/>', true)))).toBe('<ShowPlanXML/>');
        expect(await readPlanFile(fileOf(utf16('<ShowPlanXML/>', false)))).toBe('<ShowPlanXML/>');
    });
});

describe('planFileErrorMessage', () => {
    it('explains each rejection reason', () => {
        expect(planFileErrorMessage({code: ErrorCode.FileTooLarge, message: ''})).toMatch(/5 MB/);
        expect(planFileErrorMessage({code: ErrorCode.TooManyFiles, message: ''})).toMatch(/one file/);
        expect(planFileErrorMessage({code: ErrorCode.FileInvalidType, message: ''})).toMatch(/\.sqlplan/);
    });
});
