<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">CBOR to JSON Online Converter</h1>
      <p class="text-gray-600 mb-8">Convert CBOR from/to JSON string</p>

      <section class="flex flex-col md:flex-row gap-6 mb-12">
        <div class="flex-1">
          <div class="flex justify-between items-center mb-2">
            <label for="cbor-value" class="text-sm font-medium text-gray-700">CBOR</label>
            <div class="flex items-center gap-2">
              <label for="cbor-encoding" class="text-sm font-medium text-gray-700">Encoding</label>
              <select
                id="cbor-encoding"
                v-model="cborEncoding"
                class="rounded border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                @change="jsonToCbor"
              >
                <option value="base64">base64</option>
                <option value="hex">hex</option>
              </select>
            </div>
          </div>
          <div class="relative">
            <textarea
              id="cbor-value"
              v-model="cborValue"
              :placeholder="cborPlaceHolder"
              class="w-full min-h-[300px] p-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-none"
              @input="cborToJson"
            />
            <CopyButton :text="cborValue" />
          </div>
        </div>
        <div class="flex-1">
          <label for="json-value" class="block text-sm font-medium text-gray-700 mb-2">JSON</label>
          <div class="relative">
            <textarea
              id="json-value"
              v-model="jsonValue"
              :placeholder="jsonPlaceHolder"
              class="w-full min-h-[300px] p-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-none"
              @input="jsonToCbor"
            />
            <CopyButton :text="jsonValue" />
          </div>
        </div>
      </section>

      <div class="space-y-8">
        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">What is this tool?</h2>
          <div class="space-y-4 text-gray-600">
            <p>This website is an online converter for CBOR (Concise Binary Object Representation) and JSON (JavaScript Object Notation). It allows you to encode and decode data in CBOR and JSON formats.</p>
            <p>To get started, just paste your CBOR value (in base64 or hex) or a JSON string into the respective input field above.</p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">What is CBOR?</h2>
          <div class="space-y-4 text-gray-600">
            <p>CBOR (Concise Binary Object Representation) is a binary data format that aims to be smaller and more efficient than JSON. It provides a compact binary representation of structured data, making it useful for scenarios where size and performance are important.</p>
            <p>For more information, you can visit the <a ref="noopener noreferrer" href="https://cbor.io/" target="_blank" class="text-blue-600 hover:text-blue-800">CBOR website</a>.</p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Source, Issues and Development</h2>
          <p class="text-gray-600">
            Explore the <a href="https://github.com/williamchong/cbor-json-web" class="text-blue-600 hover:text-blue-800">GitHub repository</a> to view the source code, contribute to pull requests and issues.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">About me</h2>
          <p class="text-gray-600">
            Visit <a href="https://blog.williamchong.cloud" class="text-blue-600 hover:text-blue-800">my blog</a> for more developer tips and stories.
          </p>
        </section>
      </div>
    </div>
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
  link: [
    { rel: 'preload', as: 'script', href: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5384552213891537', crossorigin: 'anonymous' },
  ],
})

onMounted(() => {
  useHead({
    script: [
      { src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5384552213891537', async: true, crossorigin: 'anonymous' },
    ],
  })
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
    cborValue.value = cbor.toString(cborEncoding.value)
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