<template>
  <div class="min-h-screen bg-muted p-4 md:p-8 transition-colors">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-2">
        <h1 class="text-3xl md:text-4xl font-bold text-highlighted">{{ $t('title') }}</h1>
        <ClientOnly><ColorModeToggle /></ClientOnly>
      </div>
      <p class="text-muted mb-8">{{ $t('subtitle') }}</p>

      <section class="flex flex-col md:flex-row gap-6 mb-12">
        <div class="flex-1">
          <div class="flex justify-between items-center mb-2">
            <label for="cbor-value" class="text-sm font-medium text-default">{{ $t('cbor.label') }}</label>
            <div class="flex items-center gap-4 mx-2">
              <label for="cbor-encoding" class="text-sm font-medium text-default">{{ $t('cbor.encoding') }}</label>
              <USelect
                id="cbor-encoding"
                :model-value="cborEncoding"
                :items="encodingItems"
                size="sm"
                :aria-label="$t('cbor.encoding')"
                @update:model-value="onEncodingChange"
              />
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-lucide-file-up"
                :title="$t('cbor.uploadFile')"
                :aria-label="$t('cbor.uploadFile')"
                @click="openFileDialog()"
              />
            </div>
          </div>
          <div class="relative">
            <UTextarea
              id="cbor-value"
              v-model="cborValue"
              :placeholder="cborPlaceHolder"
              :rows="12"
              class="w-full"
              :ui="{ base: 'min-h-[300px] resize-none' }"
              @update:model-value="debouncedCborToJson"
            />
            <CopyButton :text="cborValue" />
          </div>
        </div>
        <div class="flex-1">
          <div class="flex justify-between items-center mb-2 mx-2">
            <label for="json-value" class="text-sm font-medium text-default">{{ $t('json.label') }}</label>
            <div v-if="!isJsonInput" class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <label for="buffer-format" class="text-sm font-medium text-default">{{ $t('json.bufferFormat') }}</label>
                <USelect
                  id="buffer-format"
                  :model-value="bufferFormat"
                  :items="bufferFormatItems"
                  size="sm"
                  :aria-label="$t('json.bufferFormat')"
                  @update:model-value="onBufferFormatChange"
                />
              </div>
              <UPopover>
                <UButton
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  icon="i-lucide-settings"
                  :title="$t('settings.title')"
                  :aria-label="$t('settings.title')"
                  @click="onToggleSettings"
                />
                <template #content>
                  <div class="w-64 p-4">
                    <h3 class="text-sm font-medium text-default mb-3">{{ $t('settings.title') }}</h3>
                    <div class="space-y-3">
                      <UCheckbox
                        :model-value="convertSetToArray"
                        :label="$t('settings.setToArray')"
                        @update:model-value="onToggleSetSettings"
                      />
                      <div class="space-y-1">
                        <p class="text-sm font-medium text-default">{{ $t('settings.bigintFormat.label') }}</p>
                        <URadioGroup
                          :model-value="bigintFormat"
                          :items="bigintItems"
                          @update:model-value="onToggleBigintSettings"
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </UPopover>
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
          <h2 class="text-2xl font-semibold text-highlighted mb-4">{{ $t('sections.whatIs.title') }}</h2>
          <div class="space-y-4 text-muted">
            <p v-for="(text, index) in $tm('sections.whatIs.content')" :key="index">{{ $rt(text) }}</p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-highlighted mb-4">{{ $t('sections.whatIsCbor.title') }}</h2>
          <div class="space-y-4 text-muted">
            <p v-for="(text, index) in $tm('sections.whatIsCbor.content')" :key="index">
              <i18n-t v-if="$rt(text).includes('{0}')" :keypath="'sections.whatIsCbor.content.' + index" tag="span">
                <a href="https://cbor.io/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
                  {{ $t('sections.whatIsCbor.link') }}
                </a>
              </i18n-t>
              <template v-else>{{ $rt(text) }}</template>
            </p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-highlighted mb-4">{{ $t('sections.advancedFeatures.title') }}</h2>
          <div class="space-y-4 text-muted">
            <p>{{ $t('sections.advancedFeatures.content') }}</p>
            <ul class="list-disc list-inside space-y-2">
              <li v-for="(item, index) in $tm('sections.advancedFeatures.items')" :key="index">{{ $rt(item) }}</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-highlighted mb-4">{{ $t('sections.source.title') }}</h2>
          <p class="text-muted">
            <i18n-t keypath="sections.source.content">
              <a href="https://github.com/williamchong/cbor-json-web" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">{{ $t('sections.source.link') }}</a>
            </i18n-t>
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-highlighted mb-4">{{ $t('sections.about.title') }}</h2>
          <p class="text-muted">
            <i18n-t keypath="sections.about.content">
              <a href="https://blog.williamchong.cloud?utm_source=cbor.williamchong.cloud&utm_medium=referral&utm_campaign=about" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">{{ $t('sections.about.link') }}</a>
            </i18n-t>
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn, useFileDialog } from '@vueuse/core'
import { encode } from 'cbor-x'
import { Buffer } from 'node:buffer'
import { isBase64, isHex, cborToJsonString, jsonStringToCbor, type BufferOutputFormat, type BigintOutputFormat } from '~/utils/cbor'

const { t } = useI18n()

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

const encodingItems = computed(() => [
  { label: t('cbor.encodingOptions.base64'), value: 'base64' as BufferEncoding },
  { label: t('cbor.encodingOptions.hex'), value: 'hex' as BufferEncoding }
])
const bufferFormatItems = computed(() => [
  { label: t('json.formatOptions.none'), value: 'none' as BufferOutputFormat },
  { label: t('json.formatOptions.base64'), value: 'base64' as BufferOutputFormat },
  { label: t('json.formatOptions.hex'), value: 'hex' as BufferOutputFormat }
])
const bigintItems = computed(() => [
  { label: t('settings.bigintFormat.string'), value: 'string' as BigintOutputFormat },
  { label: t('settings.bigintFormat.literal'), value: 'literal' as BigintOutputFormat }
])

const { trackEvent } = useAnalytics()

const { open: openFileDialog, onChange: onFileChange } = useFileDialog({ multiple: false, reset: true })
onFileChange(async (files) => {
  const file = files?.[0]
  if (!file) return
  trackEvent('select_file')
  try {
    const arrayBuffer = await file.arrayBuffer()
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

function onEncodingChange(value: BufferEncoding) {
  cborEncoding.value = value
  trackEvent('toggle_cbor_encoding', {
    encoding: value
  })
}

function onBufferFormatChange(value: BufferOutputFormat) {
  bufferFormat.value = value
  trackEvent('toggle_buffer_format', {
    format: value
  })
}

function onToggleSettings() {
  trackEvent('toggle_settings')
}

function onToggleSetSettings(value: boolean | 'indeterminate') {
  convertSetToArray.value = value === true
  trackEvent('toggle_settings_set_conversion')
  cborToJson()
}

function onToggleBigintSettings(value: BigintOutputFormat) {
  bigintFormat.value = value
  trackEvent('toggle_settings_bigint_format', {
    format: value
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
