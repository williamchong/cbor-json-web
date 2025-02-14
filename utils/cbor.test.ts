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
      expect(cborToJsonString(cborHex, 'hex', 'base64')).toContain('aGVsbG8=')
      expect(cborToJsonString(cborHex, 'hex', 'hex')).toContain('68656c6c6f')
      expect(cborToJsonString(cborHex, 'hex', 'none')).toContain('Buffer')
    })
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
  })
})
