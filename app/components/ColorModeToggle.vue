<template>
  <UButton
    color="neutral"
    variant="ghost"
    :icon="iconName"
    :title="$t(`components.colorModeToggle.${colorMode.preference}`)"
    :aria-label="$t('components.colorModeToggle.toggle')"
    @click="toggleColorMode"
  />
</template>

<script setup lang="ts">
import { useCycleList } from '@vueuse/core'

const colorMode = useColorMode()
const { trackEvent } = useAnalytics()

const modes = ['system', 'light', 'dark'] as const
const { next: nextMode } = useCycleList([...modes], {
  initialValue: colorMode.preference as typeof modes[number],
})

const icons = {
  light: 'i-lucide-sun',
  dark: 'i-lucide-moon',
  system: 'i-lucide-monitor',
} as const
const iconName = computed(() => icons[colorMode.preference as keyof typeof icons] ?? icons.system)

function toggleColorMode() {
  const newMode = nextMode()
  colorMode.preference = newMode
  trackEvent('toggle_color_mode', {
    mode: newMode,
  })
}
</script>
