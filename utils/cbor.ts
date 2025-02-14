import { decode, encode } from 'cbor-x';
import { Buffer } from 'node:buffer'

export function isBase64(input: string) {
  const base64Pattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  return base64Pattern.test(input);
}

export function isHex(input: string) {
  const hexPattern = /^[0-9A-Fa-f]+$/;
  return hexPattern.test(input);
}

export function stringToBuffer(input: string, encoding: BufferEncoding) {
  if (encoding === 'base64') {
    return Buffer.from(input, 'base64')
  } else {
    return Buffer.from(input, 'hex')
  }
}

export function cborToJsonString(cborValue: string, encoding: BufferEncoding) {
  if (!cborValue) return '';
  const cbor = decode(stringToBuffer(cborValue, encoding))
  return JSON.stringify(cbor, null, 2)
}

export function jsonStringToCbor(jsonValue: string, encoding: BufferEncoding): string {
  if (!jsonValue) return '';
  try {
    const parsed = JSON.parse(
      jsonValue,
      (_, value) => {
        if (value === null || value === undefined) return value;
        if (value?.type === 'Buffer' && Array.isArray(value.data)) {
          try {
            return Buffer.from(value.data);
          } catch {
            return value;
          }
        }
        return value;
      }
    );
    const cbor = encode(parsed);
    return Buffer.from(cbor).toString(encoding);
  } catch (e) {
    console.error('Error in jsonStringToCbor:', e);
    throw e;
  }
}
