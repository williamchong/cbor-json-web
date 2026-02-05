import { describe, it, expect } from 'vitest'
import { isBase64, isHex, cborToJsonString, jsonStringToCbor } from './cbor'
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
  })

  describe('isHex', () => {
    it('should return true for valid hex strings', () => {
      expect(isHex('1a2b3c')).toBe(true)
    })

    it('should return false for invalid hex strings', () => {
      expect(isHex('not-hex!')).toBe(false)
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
      expect(jsonStringToCbor(result, 'hex')).toBe(data)
    })

    it('should return empty string for empty input', () => {
      expect(cborToJsonString('', 'base64')).toBe('')
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
