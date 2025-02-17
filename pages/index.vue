<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">CBOR to JSON Online Converter</h1>
      <p class="text-gray-600 mb-8">Convert CBOR from/to JSON string</p>

      <section class="flex flex-col md:flex-row gap-6 mb-12">
        <div class="flex-1">
          <div class="flex justify-between items-center mb-2">
            <label for="cbor-value" class="text-sm font-medium text-gray-700">CBOR</label>
            <div class="flex items-center gap-4 mx-2">
              <label for="cbor-encoding" class="text-sm font-medium text-gray-700">Encoding</label>
              <select
                id="cbor-encoding"
                v-model="cborEncoding"
                class="rounded border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="base64">base64</option>
                <option value="hex">hex</option>
              </select>
              <button
                class="p-1 rounded-lg hover:bg-gray-100"
                @click="$refs.fileInput.click()"
              >
                <Icon
                  name="material-symbols:upload-file"
                  class="w-4 h-4"
                />
              </button>
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                @change="handleFileUpload"
              >
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
          <div class="flex justify-between items-center mb-2 mx-2">
            <label for="json-value" class="text-sm font-medium text-gray-700">JSON</label>
            <div v-if="!isJsonInput" class="flex items-center gap-4 relative">
              <div class="flex items-center gap-2">
                <label for="buffer-format" class="text-sm font-medium text-gray-700">Buffer Format:</label>
                <select
                  id="buffer-format"
                  v-model="bufferFormat"
                  class="rounded border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                  @change="onBufferFormatChange"
                >
                  <option value="none">none</option>
                  <option value="base64">base64</option>
                  <option value="hex">hex</option>
                </select>
              </div>
              <button
                class="p-1 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                @click="onClickSettings"
              >
                <Icon
                  name="material-symbols:settings"
                  class="w-4 h-4"
                />
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
                    @change="onToggleSetSettings"
                  >
                  <span class="text-sm text-gray-600">Convert Set to Array</span>
                </label>
              </div>
            </div>
            <div v-else class="p-4" />
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
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Buffer Handling</h2>
          <div class="space-y-4 text-gray-600">
            <p>When converting from JSON to CBOR, if a stringified Buffer object is detected in the JSON (e.g. {"type":"Buffer","data":[1,2,3]}), it will be automatically converted back to a Buffer in the CBOR output.</p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">ArrayBuffer Display Options</h2>
          <div class="space-y-4 text-gray-600">
            <p>ArrayBufferLike values in CBOR cannot be directly stringified to JSON. To handle this, you can choose how to display buffer-like values when converting from CBOR to JSON using the "Buffer Format" dropdown:</p>
            <ul class="list-disc list-inside pl-4">
              <li>none: Keep as is</li>
              <li>base64: Convert to base64 string</li>
              <li>hex: Convert to hexadecimal string</li>
            </ul>
            <p>Note that these display options only affect CBOR to JSON conversion. When converting from JSON to CBOR, buffer-like values need to be properly formatted as Buffer objects.</p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Set Support</h2>
          <div class="space-y-4 text-gray-600">
            <p>CBOR supports Set data structures, but these cannot be directly stringified to JSON. By default, Sets are automatically converted to Arrays when converting from CBOR to JSON.</p>
            <p>You can toggle this behavior in the settings menu (gear icon) next to the Buffer Format selector. When disabled, Sets will be preserved as objects with their original type information.</p>
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
const fileInput = ref<HTMLInputElement>()

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

function onBufferFormatChange() {
  useTrackEvent('toggle_buffer_format', {
    format: bufferFormat.value
  })
}

function onClickSettings() {
  useTrackEvent('toggle_settings')
  isSettingsOpen.value = !isSettingsOpen.value
}

function onToggleSetSettings() {
  useTrackEvent('toggle_settings_set_conversion', {
  })
  cborToJson()
}

async function handleFileUpload(event: Event) {
  useTrackEvent('select_file')
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    cborValue.value = buffer.toString(cborEncoding.value)
    cborToJson()
  } catch (e) {
    jsonValue.value = (e as Error).message
  }

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

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
    useTrackEvent('convert_cbor_to_json')
  } catch (e) {
    jsonValue.value = (e as Error).message
  }
}

function jsonToCbor() {
  isJsonInput.value = true
  try {
    cborValue.value = jsonStringToCbor(jsonValue.value, cborEncoding.value)
    useTrackEvent('convert_json_to_cbor')
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
