<template>
  <button
    class="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700 bg-white/80 rounded-lg shadow-sm border border-gray-200"
    :title="!copied ? t('components.copyButton.copy') : t('components.copyButton.copied')"
    :alt="t('components.copyButton.copy')"
    @click="copyText"
  >
    <Icon
      v-if="!copied"
      name="material-symbols:content-copy-outline"
      class="mt-1 w-4 h-4"
    />
    <Icon
      v-else
      name="material-symbols:check-circle-outline"
      class="mt-1 w-4 h-4"
    />
  </button>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  text: string
}>()

const copied = ref(false)
const { trackEvent } = useAnalytics()

async function copyText() {
  await navigator.clipboard.writeText(props.text)
  trackEvent('copy')
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>
