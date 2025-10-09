<!-- eslint-disable vue/no-v-html -->
<template>
  <div ref="containerRef" class="relative">
    <div v-if="isEditing" class="relative">
      <textarea
        ref="textareaRef"
        :value="code"
        :placeholder="placeholder"
        class="w-full min-h-[300px] p-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
        data-clarity-mask="true"
        @input="onInput"
        @blur="onBlur"
      />
    </div>
    <div v-else>
      <div
        v-if="highlightedCode"
        class="json-highlighter w-full min-h-[300px] p-3 rounded-lg border border-gray-300 bg-white overflow-auto focus:ring-blue-500 focus:border-blue-500 cursor-text"
        tabindex="0"
        @click="startEditing"
        @keydown.enter="startEditing"
        v-html="highlightedCode"
      />
      <div
        v-else-if="code"
        class="w-full min-h-[300px] p-3 rounded-lg border border-gray-300 bg-white overflow-auto font-mono text-sm text-red-600 whitespace-pre-wrap cursor-text"
        @click="startEditing"
      >
        {{ code }}
      </div>
      <div
        v-else
        class="w-full min-h-[300px] p-3 rounded-lg border border-gray-300 bg-white text-gray-400 font-mono text-sm cursor-text"
        @click="startEditing"
      >
        {{ placeholder }}
      </div>
    </div>
    <CopyButton :text="code" />
  </div>
</template>

<script setup lang="ts">
import { codeToHtml } from 'shiki'

const props = defineProps<{
  code: string
  placeholder: string
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:code': [value: string]
}>()

const highlightedCode = ref<string>('')
const isEditing = ref(false)
const textareaRef = ref<HTMLTextAreaElement>()
const containerRef = ref<HTMLElement>()

function onInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:code', target.value)
}

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

    const html = await codeToHtml(code, {
      lang: 'json',
      theme: 'github-light'
    })
    highlightedCode.value = html
  } catch {
    // If it's not valid JSON, show as plain text
    highlightedCode.value = `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`
  }
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

watch(() => props.code, (newCode) => {
  if (!isEditing.value) {
    highlightCode(newCode)
  }
}, { immediate: true })
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
