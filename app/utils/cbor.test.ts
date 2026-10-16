import { describe, it, expect } from 'vitest'
import { isBase64, isHex, cborToJsonString, jsonStringToCbor, detectEncoding, normalizeCborInput, valueToJsonString } from './cbor'
import { encode } from 'cbor-x'

describe('CBOR Utils', () => {
  describe('isBase64', () => {
    it('should return true for valid base64 strings', () => {
      expect(isBase64('aGVsbG8=')).toBe(true)
    })

    it('should return false for invalid base64 strings', () => {
      expect(isBase64('not-base64!')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isBase64('')).toBe(false)
    })

    it('should accept base64url and missing padding', () => {
      expect(isBase64('oWFhAQ')).toBe(true)
      expect(isBase64('-_8')).toBe(true)
    })

    it('should reject lengths that cannot be base64', () => {
      expect(isBase64('abcde')).toBe(false)
      expect(isBase64('A=')).toBe(false)
    })
  })

  describe('isHex', () => {
    it('should return true for valid hex strings', () => {
      expect(isHex('1a2b3c')).toBe(true)
    })

    it('should return false for invalid hex strings', () => {
      expect(isHex('not-hex!')).toBe(false)
    })

    it('should return false for odd-length strings', () => {
      expect(isHex('abc')).toBe(false)
    })
  })

  describe('normalizeCborInput', () => {
    it('should strip whitespace and newlines', () => {
      expect(normalizeCborInput('a1 61\n61 01\n', 'hex')).toBe('a1616101')
    })

    it('should strip a 0x prefix from hex', () => {
      expect(normalizeCborInput('0xA1616101', 'hex')).toBe('A1616101')
    })

    it('should keep a leading 0x in base64', () => {
      expect(normalizeCborInput('0xabcd', 'base64')).toBe('0xabcd')
    })
  })

  describe('detectEncoding', () => {
    it('should prefer hex when input is valid as both', () => {
      expect(detectEncoding('a1616101')).toBe('hex')
    })

    it('should detect hex with spaces and 0x prefix', () => {
      expect(detectEncoding('0x a1 61 61 01')).toBe('hex')
    })

    it('should detect base64 including unpadded base64url', () => {
      expect(detectEncoding('oWFhAQ==')).toBe('base64')
      expect(detectEncoding('oWFhAQ')).toBe('base64')
    })

    it('should return undefined for neither', () => {
      expect(detectEncoding('not cbor!')).toBeUndefined()
    })
  })

  describe('cborToJsonString', () => {
    it('should convert base64 CBOR to JSON string', () => {
      const base64CBOR = 'ZWhlbGxv'
      expect(cborToJsonString(base64CBOR, 'base64')).toBe('"hello"')
    })

    it('should convert hex CBOR to JSON string', () => {
      const hexCBOR = '6568656c6c6f'
      expect(cborToJsonString(hexCBOR, 'hex')).toBe('"hello"')
    })

    it('should handle complex objects', () => {
      const data = 'b9000466737472696e676568656c6c6f666e756d626572182a65617272617983010203666e6573746564b90001636b65796576616c7565'
      const result = cborToJsonString(data, 'hex')
      expect(jsonStringToCbor(result, 'hex')).toBe('a466737472696e676568656c6c6f666e756d626572182a65617272617983010203666e6573746564a1636b65796576616c7565')
    })

    it('should decode hex containing whitespace in full', () => {
      expect(cborToJsonString('a1 61 61\n01', 'hex')).toBe(JSON.stringify({ a: 1 }, null, 2))
    })

    it('should not silently decode a prefix of spaced hex', () => {
      expect(() => cborToJsonString('01 02', 'hex')).toThrow()
    })

    it('should decode unpadded base64url', () => {
      expect(cborToJsonString('oWFhAQ', 'base64')).toBe(JSON.stringify({ a: 1 }, null, 2))
    })

    it('should output only the bytes of a typed array view', () => {
      const view = new Uint8Array([9, 9, 104, 105, 9]).subarray(2, 4)
      expect(valueToJsonString(view, { bufferFormat: 'base64' })).toBe('"aGk="')
      expect(valueToJsonString(view, { bufferFormat: 'hex' })).toBe('"6869"')
    })

    it('should return empty string for empty input', () => {
      expect(cborToJsonString('', 'base64')).toBe('')
      expect(cborToJsonString(' \n', 'hex')).toBe('')
    })

    it('should handle buffer with different output formats', () => {
      const bufferData = Buffer.from('hello')
      const cborHex = Buffer.from(encode({ data: bufferData })).toString('hex')
      expect(cborToJsonString(cborHex, 'hex', { bufferFormat: 'base64' })).toContain('aGVsbG8=')
      expect(cborToJsonString(cborHex, 'hex', { bufferFormat: 'hex' })).toContain('68656c6c6f')
      expect(cborToJsonString(cborHex, 'hex', { bufferFormat: 'none' })).toContain('Buffer')
    })

    it('should convert Set to Array when specified', () => {
      const set = new Set([1, 2, 3]);
      const cborHex = Buffer.from(encode({ data: set })).toString('hex');
      const jsonWithSet = cborToJsonString(cborHex, 'hex', { convertSetToArray: false });
      const jsonWithArray = cborToJsonString(cborHex, 'hex', { convertSetToArray: true });
      expect(jsonWithSet).toContain('{}');
      expect(jsonWithArray).toBe(JSON.stringify({ data: Array.from(set) }, null, 2));
    });

    it('should handle BigInt values by converting to string', () => {
      const bigIntValue = BigInt('9007199254740991');
      const cborHex = Buffer.from(encode({ bigNumber: bigIntValue })).toString('hex');
      const result = cborToJsonString(cborHex, 'hex');
      expect(result).toContain('"9007199254740991"');
      expect(JSON.parse(result).bigNumber).toBe('9007199254740991');
    });

    it('should handle multiple BigInt values in complex objects', () => {
      const data = {
        smallBigInt: BigInt('123'),
        largeBigInt: BigInt('12345678901234567890'),
        nested: {
          anotherBigInt: BigInt('999999999999999999')
        },
        array: [BigInt('111'), BigInt('222')]
      };
      const cborHex = Buffer.from(encode(data)).toString('hex');
      const result = cborToJsonString(cborHex, 'hex');
      const parsed = JSON.parse(result);
      
      expect(parsed.smallBigInt).toBe('123');
      expect(parsed.largeBigInt).toBe('12345678901234567890');
      expect(parsed.nested.anotherBigInt).toBe('999999999999999999');
      expect(parsed.array[0]).toBe('111');
      expect(parsed.array[1]).toBe('222');
    });

    it('should handle BigInt with literal format option', () => {
      const bigIntValue = BigInt('9007199254740991');
      const cborHex = Buffer.from(encode({ bigNumber: bigIntValue })).toString('hex');
      const result = cborToJsonString(cborHex, 'hex', { bigintFormat: 'literal' });
      expect(result).toContain('"9007199254740991n"');
      expect(JSON.parse(result).bigNumber).toBe('9007199254740991n');
    });

    it('should handle multiple BigInt values with literal format in complex objects', () => {
      const data = {
        smallBigInt: BigInt('123'),
        largeBigInt: BigInt('12345678901234567890'),
        nested: {
          anotherBigInt: BigInt('999999999999999999')
        },
        array: [BigInt('111'), BigInt('222')]
      };
      const cborHex = Buffer.from(encode(data)).toString('hex');
      const result = cborToJsonString(cborHex, 'hex', { bigintFormat: 'literal' });
      const parsed = JSON.parse(result);
      
      expect(parsed.smallBigInt).toBe('123n');
      expect(parsed.largeBigInt).toBe('12345678901234567890n');
      expect(parsed.nested.anotherBigInt).toBe('999999999999999999n');
      expect(parsed.array[0]).toBe('111n');
      expect(parsed.array[1]).toBe('222n');
    });
  })

  describe('jsonStringToCbor', () => {
    it('should convert JSON string to base64 CBOR', () => {
      const json = '"hello"'
      const result = jsonStringToCbor(json, 'base64')
      expect(cborToJsonString(result, 'base64')).toBe(json)
    })

    it('should convert JSON string to hex CBOR', () => {
      const json = '"hello"'
      const result = jsonStringToCbor(json, 'hex')
      expect(cborToJsonString(result, 'hex')).toBe(json)
    })

    it('should handle complex objects', () => {
      const json = JSON.stringify({
        string: "hello",
        number: 42,
        array: [1,2,3],
        nested: { key: "value" }
      }, null, 2)
      const result = jsonStringToCbor(json, 'base64')
      expect(cborToJsonString(result, 'base64')).toBe(json)
    })

    it('should handle Buffer', () => {
      const json = JSON.stringify({
        buffer: Buffer.from('hello')
      }, null, 2)
      const result = jsonStringToCbor(json, 'hex')
      expect(cborToJsonString(result, 'hex')).toBe(json)
    })

    it('should handle null values', () => {
      const json = 'null'
      const result = jsonStringToCbor(json, 'hex')
      expect(cborToJsonString(result, 'hex')).toBe(json)
    })

    it('should return empty string for empty input', () => {
      expect(jsonStringToCbor('', 'base64')).toBe('')
    })

    it('should encode maps with the shortest header', () => {
      expect(jsonStringToCbor('{"a":1}', 'hex')).toBe('a1616101')
    })

    it('should parse negative bigint literals back to BigInt', () => {
      const result = jsonStringToCbor('{"n":"-12345678901234567890n"}', 'hex')
      const parsed = JSON.parse(cborToJsonString(result, 'hex', { bigintFormat: 'literal' }))
      expect(parsed.n).toBe('-12345678901234567890n')
    })

    it('should parse bigint literals back to BigInt', () => {
      const json = JSON.stringify({
        bigNumber: '9007199254740991n',
        smallBig: '123n'
      }, null, 2)
      const result = jsonStringToCbor(json, 'hex')
      const backToJson = cborToJsonString(result, 'hex')
      const parsed = JSON.parse(backToJson)
      
      expect(parsed.bigNumber).toBe('9007199254740991')
      expect(parsed.smallBig).toBe('123')
    })

    it('should handle round-trip conversion with bigint literal format', () => {
      const originalData = {
        bigInt: BigInt('12345678901234567890'),
        regularString: '123n_not_bigint',
        number: 42
      }
      const cborHex = Buffer.from(encode(originalData)).toString('hex')
      
      // Convert to JSON with literal format
      const jsonWithLiteral = cborToJsonString(cborHex, 'hex', { bigintFormat: 'literal' })
      
      // Convert back to CBOR
      const backToCbor = jsonStringToCbor(jsonWithLiteral, 'hex')
      
      // Convert back to JSON with regular format
      const finalJson = cborToJsonString(backToCbor, 'hex', { bigintFormat: 'string' })
      const parsed = JSON.parse(finalJson)
      
      expect(parsed.bigInt).toBe('12345678901234567890')
      expect(parsed.regularString).toBe('123n_not_bigint')
      expect(parsed.number).toBe(42)
    })

    it('should not parse invalid bigint literal strings', () => {
      const json = JSON.stringify({
        validBigint: '123n',
        invalidBigint1: '123nn',
        invalidBigint2: 'n123',
        invalidBigint3: '12.3n',
        regularString: 'normal string'
      }, null, 2)
      const result = jsonStringToCbor(json, 'hex')
      const backToJson = cborToJsonString(result, 'hex')
      const parsed = JSON.parse(backToJson)
      
      expect(parsed.validBigint).toBe('123')
      expect(parsed.invalidBigint1).toBe('123nn')
      expect(parsed.invalidBigint2).toBe('n123')
      expect(parsed.invalidBigint3).toBe('12.3n')
      expect(parsed.regularString).toBe('normal string')
    })
  })
})
