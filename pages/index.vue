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
          <div class="flex justify-between items-center mb-2">
            <label for="json-value" class="text-sm font-medium text-gray-700">JSON</label>
            <div v-if="!isJsonInput" class="flex items-center gap-4 relative">
              <div class="flex items-center gap-2">
                <label for="buffer-format" class="text-sm font-medium text-gray-700">Buffer Format:</label>
                <select
                  id="buffer-format"
                  v-model="bufferFormat"
                  class="rounded border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                  @change="cborToJson"
                >
                  <option value="none">none</option>
                  <option value="base64">base64</option>
                  <option value="hex">hex</option>
                </select>
              </div>
              <button
                class="px-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                @click="isSettingsOpen = !isSettingsOpen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <div
                v-show="isSettingsOpen"
                class="absolute right-0 top-full mt-2 w-64 p-4 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
              >
                <h3 class="text-sm font-medium text-gray-700 mb-3">Conversion Settings</h3>
                <label class="flex items-center gap-2">
                  <input
                    v-model="convertSetToArray"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    @change="cborToJson"
                  >
                  <span class="text-sm text-gray-600">Convert Set to Array</span>
                </label>
              </div>
            </div>
          </div>
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
            <p>For more information, you can visit the <a ref="noneener noreferrer" href="https://cbor.io/" target="_blank" class="text-blue-600 hover:text-blue-800">CBOR website</a>.</p>
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
import { encode } from 'cbor-x'
import { Buffer } from 'node:buffer'
import { isBase64, isHex, cborToJsonString, jsonStringToCbor, type BufferOutputFormat } from '~/utils/cbor'

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
const cborPlaceHolder = computed(() => Buffer.from(encode(JSON.parse(jsonPlaceHolder))).toString(cborEncoding.value))
const bufferFormat = ref<BufferOutputFormat>('none')
const isJsonInput = ref(false)
const convertSetToArray = ref(true)
const isSettingsOpen = ref(false)

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

watch(cborEncoding, () => {
  if (isJsonInput.value) {
    jsonToCbor()
  } else {
    cborToJson()
  }
})

watch(bufferFormat, () => {
  if (isJsonInput.value) return;
  cborToJson()
})

function cborToJson() {
  isJsonInput.value = false
  try {
    if (isBase64(cborValue.value) && !isHex(cborValue.value)) {
      cborEncoding.value = 'base64'
    } else if (!isBase64(cborValue.value) && isHex(cborValue.value)) {
      cborEncoding.value = 'hex'
    }
    jsonValue.value = cborToJsonString(cborValue.value, cborEncoding.value, {
      bufferFormat: bufferFormat.value,
      convertSetToArray: convertSetToArray.value
    })
  } catch (e) {
    jsonValue.value = (e as Error).message
  }
}

function jsonToCbor() {
  isJsonInput.value = true
  try {
    cborValue.value = jsonStringToCbor(jsonValue.value, cborEncoding.value)
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