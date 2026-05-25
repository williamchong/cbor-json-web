<template>
  <UButton
    class="absolute top-2 right-2"
    color="neutral"
    variant="subtle"
    size="sm"
    :icon="copied ? 'i-lucide-circle-check' : 'i-lucide-copy'"
    :title="!copied ? t('components.copyButton.copy') : t('components.copyButton.copied')"
    :aria-label="t('components.copyButton.copy')"
    @click="copyText"
  />
</template>

<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const { t } = useI18n()

const props = defineProps<{
  text: string
}>()

const { copy, copied } = useClipboard({ copiedDuring: 2000 })
const { trackEvent } = useAnalytics()

async function copyText() {
  await copy(props.text)
  trackEvent('copy')
}
</script>
