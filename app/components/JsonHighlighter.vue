<!-- eslint-disable vue/no-v-html -->
<template>
  <div ref="containerRef" class="relative">
    <div v-if="isEditing" class="relative">
      <UTextarea
        ref="textareaComp"
        v-model="editableCode"
        :placeholder="placeholder"
        :rows="12"
        class="w-full"
        :ui="{ base: 'h-[300px] resize-none font-mono text-sm' }"
        @blur="onBlur"
      />
    </div>
    <div v-else>
      <div
        class="json-highlighter w-full h-[300px] p-3 rounded-md border border-default bg-default overflow-auto cursor-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
const textareaComp = ref<{ textareaRef?: HTMLTextAreaElement }>()
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
    textareaComp.value?.textareaRef?.focus()
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
</style>
