<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-2">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">{{ $t('title') }}</h1>
        <ClientOnly><ColorModeToggle /></ClientOnly>
      </div>
      <p class="text-gray-600 dark:text-gray-400 mb-8">{{ $t('subtitle') }}</p>

      <section class="flex flex-col md:flex-row gap-6 mb-12">
        <div class="flex-1">
          <div class="flex justify-between items-center mb-2">
            <label for="cbor-value" class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('cbor.label') }}</label>
            <div class="flex items-center gap-4 mx-2">
              <label for="cbor-encoding" class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('cbor.encoding') }}</label>
              <select
                id="cbor-encoding"
                class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 text-sm focus:ring-blue-500 focus:border-blue-500"
                @change="onEncodingChange"
              >
                <option value="base64">{{ $t('cbor.encodingOptions.base64') }}</option>
                <option value="hex">{{ $t('cbor.encodingOptions.hex') }}</option>
              </select>
              <button
                class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                :title="$t('cbor.uploadFile')"
                :alt="$t('cbor.uploadFile')"
                @click="openFileDialog()"
              >
                <Icon
                  name="material-symbols:upload-file"
                  class="w-4 h-4 text-gray-700 dark:text-gray-300"
                />
              </button>
            </div>
          </div>
          <div class="relative">
            <textarea
              id="cbor-value"
              v-model="cborValue"
              :placeholder="cborPlaceHolder"
              class="w-full min-h-[300px] p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500 resize-none"
              @input="debouncedCborToJson"
            />
            <CopyButton :text="cborValue" />
          </div>
        </div>
        <div class="flex-1">
          <div class="flex justify-between items-center mb-2 mx-2">
            <label for="json-value" class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('json.label') }}</label>
            <div v-if="!isJsonInput" ref="settingsRef" class="flex items-center gap-4 relative">
              <div class="flex items-center gap-2">
                <label for="buffer-format" class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('json.bufferFormat') }}</label>
                <select
                  id="buffer-format"
                  class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 text-sm focus:ring-blue-500 focus:border-blue-500"
                  @change="onBufferFormatChange"
                >
                  <option value="none">{{ $t('json.formatOptions.none') }}</option>
                  <option value="base64">{{ $t('json.formatOptions.base64') }}</option>
                  <option value="hex">{{ $t('json.formatOptions.hex') }}</option>
                </select>
              </div>
              <button
                class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                :title="$t('settings.title')"
                :alt="$t('settings.title')"
                @click="onClickSettings"
              >
                <Icon
                  name="material-symbols:settings"
                  class="w-4 h-4 text-gray-700 dark:text-gray-300"
                />
              </button>
              <div
                v-show="isSettingsOpen"
                class="absolute right-0 top-full mt-2 w-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
              >
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{{ $t('settings.title') }}</h3>
                <div class="space-y-3">
                  <label class="flex items-center gap-2">
                    <input
                      v-model="convertSetToArray"
                      type="checkbox"
                      class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      @change="onToggleSetSettings"
                    >
                    <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('settings.setToArray') }}</span>
                  </label>
                  <div class="space-y-1">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('settings.bigintFormat.label') }}</label>
                    <div class="space-y-2">
                      <label class="flex items-center gap-2">
                        <input
                          v-model="bigintFormat"
                          type="radio"
                          value="string"
                          class="text-blue-600 focus:ring-blue-500"
                          @change="onToggleBigintSettings"
                        >
                        <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('settings.bigintFormat.string') }}</span>
                      </label>
                      <label class="flex items-center gap-2">
                        <input
                          v-model="bigintFormat"
                          type="radio"
                          value="literal"
                          class="text-blue-600 focus:ring-blue-500"
                          @change="onToggleBigintSettings"
                        >
                        <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('settings.bigintFormat.literal') }}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="p-4" />
          </div>
          <JsonHighlighter
            :code="jsonValue"
            :placeholder="jsonPlaceHolderString"
            :editable="true"
            @update:code="onJsonUpdate"
          />
        </div>
      </section>

      <div class="space-y-8">
        <section>
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{{ $t('sections.whatIs.title') }}</h2>
          <div class="space-y-4 text-gray-600 dark:text-gray-400">
            <p v-for="(text, index) in $tm('sections.whatIs.content')" :key="index">{{ $rt(text) }}</p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{{ $t('sections.whatIsCbor.title') }}</h2>
          <div class="space-y-4 text-gray-600 dark:text-gray-400">
            <p v-for="(text, index) in $tm('sections.whatIsCbor.content')" :key="index">
              <i18n-t v-if="index === 1" :keypath="'sections.whatIsCbor.content.' + index" tag="span">
                <a href="https://cbor.io/" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                  {{ $t('sections.whatIsCbor.link') }}
                </a>
              </i18n-t>
              <template v-else>{{ $rt(text) }}</template>
            </p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{{ $t('sections.bufferHandling.title') }}</h2>
          <div class="space-y-4 text-gray-600 dark:text-gray-400">
            <p v-for="(text, index) in $tm('sections.bufferHandling.content')" :key="index">{{ $rt(text) }}</p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{{ $t('sections.arrayBuffer.title') }}</h2>
          <div class="space-y-4 text-gray-600 dark:text-gray-400">
            <p v-for="(text, index) in $tm('sections.arrayBuffer.content')" :key="index">{{ $rt(text) }}</p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{{ $t('sections.setSupport.title') }}</h2>
          <div class="space-y-4 text-gray-600 dark:text-gray-400">
            <p v-for="(text, index) in $tm('sections.setSupport.content')" :key="index">{{ $rt(text) }}</p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{{ $t('sections.source.title') }}</h2>
          <p class="text-gray-600 dark:text-gray-400">
            <i18n-t keypath="sections.source.content">
              <a href="https://github.com/williamchong/cbor-json-web" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">{{ $t('sections.source.link') }}</a>
            </i18n-t>
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{{ $t('sections.about.title') }}</h2>
          <p class="text-gray-600 dark:text-gray-400">
            <i18n-t keypath="sections.about.content">
              <a href="https://blog.williamchong.cloud" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">{{ $t('sections.about.link') }}</a>
            </i18n-t>
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn, onClickOutside, useFileDialog } from '@vueuse/core'
import { encode } from 'cbor-x'
import { Buffer } from 'node:buffer'
import { isBase64, isHex, cborToJsonString, jsonStringToCbor, type BufferOutputFormat, type BigintOutputFormat } from '~/utils/cbor'

const cborValue = ref('')
const jsonValue = ref('')
const cborEncoding = ref('base64' as BufferEncoding)
const jsonPlaceHolder = {
  hello: 'world',
  array: [1, 2, 3],
  nested: {
    key: 'value'
  },
  buffer: Buffer.from('example data')
}
const jsonPlaceHolderString = computed(() => valueToJsonString(jsonPlaceHolder, {
  bufferFormat: bufferFormat.value,
  convertSetToArray: convertSetToArray.value,
  bigintFormat: bigintFormat.value
}))
const cborPlaceHolder = computed(() => Buffer.from(encode(jsonPlaceHolder)).toString(cborEncoding.value))
const bufferFormat = ref<BufferOutputFormat>('none')
const bigintFormat = ref<BigintOutputFormat>('string')
const isJsonInput = ref(false)
const convertSetToArray = ref(true)
const isSettingsOpen = ref(false)
const settingsRef = ref<HTMLElement>()

const { trackEvent } = useAnalytics()

onClickOutside(settingsRef, () => { isSettingsOpen.value = false })

const { open: openFileDialog, onChange: onFileChange } = useFileDialog({ multiple: false, reset: true })
onFileChange(async (files) => {
  if (!files?.length) return
  trackEvent('select_file')
  try {
    const arrayBuffer = await files[0].arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    cborValue.value = buffer.toString(cborEncoding.value)
    cborToJson()
  } catch (e) {
    jsonValue.value = (e as Error).message
  }
})

const debouncedCborToJson = useDebounceFn(() => cborToJson(), 200)
const debouncedJsonToCbor = useDebounceFn(() => jsonToCbor(), 200)

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

function onEncodingChange(e: Event) {
  cborEncoding.value = (e.target as HTMLSelectElement).value as BufferEncoding
  trackEvent('toggle_cbor_encoding', {
    encoding: cborEncoding.value
  })
}

function onBufferFormatChange(e: Event) {
  bufferFormat.value = (e.target as HTMLSelectElement).value as BufferOutputFormat
  trackEvent('toggle_buffer_format', {
    format: bufferFormat.value
  })
}

function onClickSettings() {
  trackEvent('toggle_settings')
  isSettingsOpen.value = !isSettingsOpen.value
}

function onToggleSetSettings() {
  trackEvent('toggle_settings_set_conversion')
  cborToJson()
}

function onToggleBigintSettings() {
  trackEvent('toggle_settings_bigint_format', {
    format: bigintFormat.value
  })
  cborToJson()
}

function cborToJson() {
  isJsonInput.value = false
  try {
    if (!cborValue.value) {
      jsonValue.value = ''
      return
    }
    if (isBase64(cborValue.value) && !isHex(cborValue.value)) {
      cborEncoding.value = 'base64'
    } else if (!isBase64(cborValue.value) && isHex(cborValue.value)) {
      cborEncoding.value = 'hex'
    }
    jsonValue.value = cborToJsonString(cborValue.value, cborEncoding.value, {
      bufferFormat: bufferFormat.value,
      convertSetToArray: convertSetToArray.value,
      bigintFormat: bigintFormat.value
    })
    trackEvent('convert_cbor_to_json')
  } catch (e) {
    jsonValue.value = (e as Error).message
  }
}

function jsonToCbor() {
  isJsonInput.value = true
  try {
    cborValue.value = jsonStringToCbor(jsonValue.value, cborEncoding.value)
    trackEvent('convert_json_to_cbor')
  } catch (e) {
    cborValue.value = (e as Error).message
  }
}

function onJsonUpdate(newValue: string) {
  jsonValue.value = newValue
  debouncedJsonToCbor()
}
</script>
