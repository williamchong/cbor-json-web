<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{{ $t('title') }}</h1>
      <p class="text-gray-600 mb-8">{{ $t('subtitle') }}</p>

      <section class="flex flex-col md:flex-row gap-6 mb-12">
        <div class="flex-1">
          <div class="flex justify-between items-center mb-2">
            <label for="cbor-value" class="text-sm font-medium text-gray-700">{{ $t('cbor.label') }}</label>
            <div class="flex items-center gap-4 mx-2">
              <label for="cbor-encoding" class="text-sm font-medium text-gray-700">{{ $t('cbor.encoding') }}</label>
              <select
                id="cbor-encoding"
                v-model="cborEncoding"
                class="rounded border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="base64">{{ $t('cbor.encodingOptions.base64') }}</option>
                <option value="hex">{{ $t('cbor.encodingOptions.hex') }}</option>
              </select>
              <button
                class="p-1 rounded-lg hover:bg-gray-100"
                :title="$t('cbor.uploadFile')"
                :alt="$t('cbor.uploadFile')"
                @click="fileInput?.click()"
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
            <label for="json-value" class="text-sm font-medium text-gray-700">{{ $t('json.label') }}</label>
            <div v-if="!isJsonInput" class="flex items-center gap-4 relative">
              <div class="flex items-center gap-2">
                <label for="buffer-format" class="text-sm font-medium text-gray-700">{{ $t('json.bufferFormat') }}</label>
                <select
                  id="buffer-format"
                  v-model="bufferFormat"
                  class="rounded border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                  @change="onBufferFormatChange"
                >
                  <option value="none">{{ $t('json.formatOptions.none') }}</option>
                  <option value="base64">{{ $t('json.formatOptions.base64') }}</option>
                  <option value="hex">{{ $t('json.formatOptions.hex') }}</option>
                </select>
              </div>
              <button
                class="p-1 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                :title="$t('settings.title')"
                :alt="$t('settings.title')"
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
                <h3 class="text-sm font-medium text-gray-700 mb-3">{{ $t('settings.title') }}</h3>
                <label class="flex items-center gap-2">
                  <input
                    v-model="convertSetToArray"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    @change="onToggleSetSettings"
                  >
                  <span class="text-sm text-gray-600">{{ $t('settings.setToArray') }}</span>
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
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">{{ $t('sections.whatIs.title') }}</h2>
          <div class="space-y-4 text-gray-600">
            <p v-for="(text, index) in $tm('sections.whatIs.content')" :key="index">{{ $rt(text) }}</p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">{{ $t('sections.whatIsCbor.title') }}</h2>
          <div class="space-y-4 text-gray-600">
            <p v-for="(text, index) in $tm('sections.whatIsCbor.content')" :key="index">
              <i18n-t v-if="index === 1" :keypath="'sections.whatIsCbor.content.' + index" tag="span">
                <a href="https://cbor.io/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800">
                  {{ $t('sections.whatIsCbor.link') }}
                </a>
              </i18n-t>
              <template v-else>{{ $rt(text) }}</template>
            </p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">{{ $t('sections.bufferHandling.title') }}</h2>
          <div class="space-y-4 text-gray-600">
            <p v-for="(text, index) in $tm('sections.bufferHandling.content')" :key="index">{{ $rt(text) }}</p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">{{ $t('sections.arrayBuffer.title') }}</h2>
          <div class="space-y-4 text-gray-600">
            <p v-for="(text, index) in $tm('sections.arrayBuffer.content')" :key="index">{{ $rt(text) }}</p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">{{ $t('sections.setSupport.title') }}</h2>
          <div class="space-y-4 text-gray-600">
            <p v-for="(text, index) in $tm('sections.setSupport.content')" :key="index">{{ $rt(text) }}</p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">{{ $t('sections.source.title') }}</h2>
          <p class="text-gray-600">
            <i18n-t keypath="sections.source.content">
              <a href="https://github.com/williamchong/cbor-json-web" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800">{{ $t('sections.source.link') }}</a>
            </i18n-t>
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">{{ $t('sections.about.title') }}</h2>
          <p class="text-gray-600">
            <i18n-t keypath="sections.about.content">
              <a href="https://blog.williamchong.cloud" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800">{{ $t('sections.about.link') }}</a>
            </i18n-t>
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
