<template>
  <button
    class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    :title="$t(`components.colorModeToggle.${colorMode.preference}`)"
    :aria-label="$t('components.colorModeToggle.toggle')"
    @click="toggleColorMode"
  >
    <Icon
      :name="iconName"
      class="w-5 h-5 text-gray-700 dark:text-gray-300"
    />
  </button>
</template>

<script setup lang="ts">
import { useCycleList } from '@vueuse/core'

const colorMode = useColorMode()
const { trackEvent } = useAnalytics()

const modes = ['system', 'light', 'dark'] as const
const { next: nextMode } = useCycleList([...modes], {
  initialValue: colorMode.preference as typeof modes[number],
})

const icons: Record<string, string> = {
  light: 'material-symbols:light-mode-outline',
  dark: 'material-symbols:dark-mode-outline',
  system: 'material-symbols:computer-outline',
}
const iconName = computed(() => icons[colorMode.preference] || icons.system)

function toggleColorMode() {
  const newMode = nextMode()
  colorMode.preference = newMode
  trackEvent('toggle_color_mode', {
    mode: newMode,
  })
}
</script>
