<template>
  <div>
    <h1>CBOR to JSON Online Converter</h1>
    <p>Convert CBOR from/to JSON string</p>
    <section style="display: flex; flex-wrap: wrap;">
      <div style="flex: 1">
        <div style="display: flex; gap: 25%;">
          <label for="cbor-value">CBOR</label>
          <div>
            <label for="cbor-encoding">Encoding</label>
            <select @change="jsonToCbor" id="cbor-encoding" v-model="cborEncoding">
              <option value="base64">base64</option>
              <option value="hex">hex</option>
            </select>
          </div>
        </div>
        <textarea id="cbor-value" @input="cborToJson" v-model="cborValue" :placeholder="cborPlaceHolder" />
      </div>
      <div style="flex: 1">
        <label for="json-value">JSON</label>
        <br />
        <textarea id="json-value" @input="jsonToCbor" v-model="jsonValue" :placeholder="jsonPlaceHolder" />
      </div>
    </section>
    <section>
      <h2>What is this tool?</h2>
      <p>This website is an online converter for CBOR (Concise Binary Object Representation) and JSON (JavaScript Object
        Notation). It allows you to encode and decode data in CBOR and JSON formats.</p>
      <p>To get started, just paste your CBOR value (in base64 or hex) or a JSON string into the respective input field
        above.</p>
    </section>
    <section>
      <h2>What is CBOR?</h2>
      <p>CBOR (Concise Binary Object Representation) is a binary data format that aims to be smaller and more efficient
        than JSON. It provides a compact binary representation of structured data, making it useful for scenarios where
        size and performance are important.</p>
      <p>For more information, you can visit the <a href="https://cbor.io/" target="_blank"
          ref="noopener noreferrer">CBOR website</a>.</p>
    </section>
    <section>
      <h2>Source, Issues and Development</h2>
      <p>Explore the <a href="https://github.com/williamchong/cbor-json-web">GitHub repository</a> to view the source
        code, contribute to pull requests and issues.</p>
    </section>
    <section>
      <h2>About me</h2>
      <p>Visit <a href="https://blog.williamchong.cloud">my blog</a> for more developer tips and stories.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { decode, encode } from 'cbor-x';
import { Buffer } from 'node:buffer'

const cborValue = ref('')
const jsonValue = ref('')
const cborEncoding = ref('base64' as BufferEncoding)
const jsonPlaceHolder = JSON.stringify({
  hello: 'world',
  array: [1, 2, 3],
  nested: {
    key: 'value'
  }
})
const cborPlaceHolder = computed(() => Buffer.from(jsonPlaceHolder).toString(cborEncoding.value))

useHead({
  title: 'CBOR to JSON Online Converter',
  meta: [
    { name: 'og:title', content: 'CBOR to JSON Online Converter' },
    { name: 'description', content: 'Easily convert data between CBOR (Concise Binary Object Representation) and JSON (JavaScript Object Notation) formats with this online web decoder.' }
  ],
})

function isBase64(input: string) {
  const base64Pattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  return base64Pattern.test(input);
}

function isHex(input: string) {
  const hexPattern = /^[0-9A-Fa-f]+$/;
  return hexPattern.test(input);
}

function stringToBuffer(input: string) {
  if (cborEncoding.value === 'base64') {
    return Buffer.from(input, 'base64')
  } else {
    return Buffer.from(input, 'hex')
  }
}

function cborToJson() {
  try {
    if (isBase64(cborValue.value) && !isHex(cborValue.value)) {
      cborEncoding.value = 'base64'
    } else if (!isBase64(cborValue.value) && isHex(cborValue.value)) {
      cborEncoding.value = 'hex'
    }
    const cbor = decode(stringToBuffer(cborValue.value))
    jsonValue.value = JSON.stringify(cbor, null, 2)
  } catch (e) {
    jsonValue.value = (e as Error).message
  }
}

function jsonToCbor() {
  try {
    if (!jsonValue.value) {
      cborValue.value = ''
      return
    }
    const cbor = encode(JSON.parse(jsonValue.value))
    cborValue.value = Buffer.from(cbor).toString(cborEncoding.value)
  } catch (e) {
    cborValue.value = (e as Error).message
  }
}
</script>

<style scoped>
textarea {
  width: 100%;
  min-height: 300px;
}
</style>