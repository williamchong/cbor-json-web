import { decode, Encoder } from 'cbor-x';
import { Buffer } from 'node:buffer'

// Default cbor-x encode writes 16-bit map headers (b9 0001) instead of the
// shortest form, and a fresh Encoder enables record extensions unless told not to
const encoder = new Encoder({ variableMapSize: true, useRecords: false });

export function encodeCbor(value: unknown) {
  return encoder.encode(value);
}

export function isBase64(input: string) {
  if (!input || input.length % 4 === 1) return false;
  if (input.includes('=') && input.length % 4 !== 0) return false;
  // Accepts base64url characters and missing padding, both of which Buffer decodes
  const base64Pattern = /^[A-Za-z0-9+/_-]*={0,2}$/;
  return base64Pattern.test(input);
}

export function isHex(input: string) {
  const hexPattern = /^(?:[0-9A-Fa-f]{2})+$/;
  return hexPattern.test(input);
}

// Strips whitespace (and 0x for hex) so pasted hex dumps decode in full;
// Buffer.from(_, 'hex') silently stops at the first invalid character
export function normalizeCborInput(input: string, encoding: BufferEncoding) {
  const compact = input.replace(/\s+/g, '');
  return encoding === 'hex' ? compact.replace(/^0x/i, '') : compact;
}

// Every hex string of length divisible by 4 is also valid base64, so hex wins ties
export function detectEncoding(input: string): BufferEncoding | undefined {
  if (isHex(normalizeCborInput(input, 'hex'))) return 'hex';
  if (isBase64(normalizeCborInput(input, 'base64'))) return 'base64';
  return undefined;
}

export function stringToBuffer(input: string, encoding: BufferEncoding) {
  if (encoding === 'base64') {
    return Buffer.from(input, 'base64')
  } else {
    return Buffer.from(input, 'hex')
  }
}

export type BufferOutputFormat = 'base64' | 'hex' | 'none';
export type BigintOutputFormat = 'string' | 'literal';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isBufferObject(value: any): boolean {
  return value instanceof Buffer || value?.type === 'Buffer' && Array.isArray(value?.data);
}

export function valueToJsonString(
  value: unknown,
  {
    bufferFormat = 'none',
    convertSetToArray = false,
    bigintFormat = 'string',
  }: {
    bufferFormat?: BufferOutputFormat;
    convertSetToArray?: boolean;
    bigintFormat?: BigintOutputFormat;
  } = {}
): string {
  return JSON.stringify(value, (_key, val) => {
    if (typeof val === 'bigint') {
      return bigintFormat === 'literal' ? `${val.toString()}n` : val.toString();
    }
    if (isBufferObject(val) || ArrayBuffer.isView(val)) {
      // A view's .buffer is the whole backing store, so slice it to the view's range
      const bytes = ArrayBuffer.isView(val)
        ? Buffer.from(val.buffer, val.byteOffset, val.byteLength)
        : Buffer.from(val);
      switch (bufferFormat) {
        case 'base64':
          return bytes.toString('base64');
        case 'hex':
          return bytes.toString('hex');
        default:
          return val;
      }
    }
    if (convertSetToArray && val instanceof Set) {
      return Array.from(val);
    }
    return val;
  }, 2)
}

export function cborToJsonString(
  cborValue: string,
  encoding: BufferEncoding,
  {
    bufferFormat = 'none',
    convertSetToArray = false,
    bigintFormat = 'string',
  }: {
    bufferFormat?: BufferOutputFormat;
    convertSetToArray?: boolean;
    bigintFormat?: BigintOutputFormat;
  } = {}
) {
  const normalized = normalizeCborInput(cborValue, encoding);
  if (!normalized) return '';
  const cbor = decode(stringToBuffer(normalized, encoding))
  return valueToJsonString(cbor, {
    bufferFormat,
    convertSetToArray,
    bigintFormat,
  });
}

export function jsonStringToCbor(jsonValue: string, encoding: BufferEncoding): string {
  if (!jsonValue) return '';
  try {
    const parsed = JSON.parse(
      jsonValue,
      (_, value) => {
        if (value === null || value === undefined) return value;
        if (typeof value === 'string' && /^-?\d+n$/.test(value)) {
          try {
            return BigInt(value.slice(0, -1));
          } catch {
            return value;
          }
        }
        if (isBufferObject(value)) {
          try {
            return Buffer.from(value.data);
          } catch {
            return value;
          }
        }
        return value;
      }
    );
    const cbor = encodeCbor(parsed);
    return Buffer.from(cbor).toString(encoding);
  } catch (e) {
    console.error('Error in jsonStringToCbor:', e);
    throw e;
  }
}
