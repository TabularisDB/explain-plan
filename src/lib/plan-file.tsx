import {ErrorCode, type Accept, type FileError} from 'react-dropzone';

export const MAX_PLAN_FILE_SIZE = 5 * 1024 * 1024;

export const PLAN_FILE_ACCEPT: Accept = {
    'application/json': ['.json'],
    'text/xml': ['.xml', '.sqlplan'],
    'text/plain': ['.txt', '.log'],
};

export function planFileErrorMessage(error: FileError): string {
    switch (error.code) {
        case ErrorCode.FileTooLarge:
            return 'This file is larger than 5 MB.';
        case ErrorCode.TooManyFiles:
            return 'Drop one file at a time.';
        case ErrorCode.FileInvalidType:
            return 'Choose a .json, .xml, .sqlplan, .txt or .log file.';
        default:
            return error.message;
    }
}

export async function readPlanFile(file: File): Promise<string> {
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes);
    if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(bytes);
    return new TextDecoder('utf-8').decode(bytes);
}
