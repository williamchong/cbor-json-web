<!-- eslint-disable vue/no-v-html -->
<template>
  <div ref="containerRef" class="relative">
    <div v-if="isEditing" class="relative">
      <textarea
        ref="textareaRef"
        v-model="editableCode"
        :placeholder="placeholder"
        class="w-full h-[300px] p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
        @blur="onBlur"
      />
    </div>
    <div v-else>
      <div
        class="json-highlighter w-full h-[300px] p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 overflow-auto focus:ring-blue-500 focus:border-blue-500 cursor-text"
        tabindex="0"
        @click="startEditing"
        @keydown.enter="startEditing"
        v-html="highlightedCode"
      />
    </div>
    <CopyButton :text="code" />
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { codeToHtml } from 'shiki/bundle/web'

const props = defineProps<{
  code: string
  placeholder: string
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:code': [value: string]
}>()

const colorMode = useColorMode()
const highlightedCode = ref<string>('')
const isEditing = ref(false)
const textareaRef = ref<HTMLTextAreaElement>()
const containerRef = ref<HTMLElement>()

const editableCode = computed({
  get: () => props.code,
  set: (value: string) => emit('update:code', value)
})

const debouncedHighlightCode = useDebounceFn((code: string) => highlightCode(code), 150)

function onBlur(event: FocusEvent) {
  // Check if focus is moving to another element within THIS component
  const relatedTarget = event.relatedTarget as HTMLElement
  if (relatedTarget && containerRef.value?.contains(relatedTarget)) {
    // Focus is staying within this component, don't exit edit mode
    return
  }
  // Use requestAnimationFrame to ensure this runs after other events
  requestAnimationFrame(() => {
    isEditing.value = false
  })
}

function startEditing() {
  if (!props.editable) return
  isEditing.value = true
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

async function highlightCode(code: string) {
  if (!code || code.trim() === '') {
    highlightedCode.value = ''
    return
  }

  try {
    // Try to parse as JSON to validate
    JSON.parse(code)

    const theme = colorMode.value === 'dark' ? 'github-dark' : 'github-light'
    const html = await codeToHtml(code, {
      lang: 'json',
      theme
    })
    highlightedCode.value = html
  } catch (err) {
    console.error(err)
    // If it's not valid JSON, show as plain text with the same theme
    const theme = colorMode.value === 'dark' ? 'github-dark' : 'github-light'
    const html = await codeToHtml(code, {
      lang: 'text',
      theme
    })
    highlightedCode.value = html
  }
}

watch(() => props.code, (newCode) => {
  debouncedHighlightCode(newCode || props.placeholder)
})

onMounted(() => {
  highlightCode(props.code || props.placeholder)
})

watch(() => props.placeholder, (newPlaceholder) => {
  if (!props.code) {
    debouncedHighlightCode(newPlaceholder)
  }
})

watch(() => colorMode.value, () => {
  highlightCode(props.code || props.placeholder)
})
</script>

<style scoped>
.json-highlighter :deep(pre) {
  margin: 0;
  padding: 0;
  background: transparent !important;
  overflow: visible;
}

.json-highlighter :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

textarea {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
}
</style>
