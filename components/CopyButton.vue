<template>
  <button
    class="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 bg-white/80 rounded-lg shadow-sm border border-gray-200"
    @click="copyText"
  >
    <svg
      v-if="!copied"
      class="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
    <svg
      v-else
      class="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  text: string
}>()

const copied = ref(false)

async function copyText() {
  await navigator.clipboard.writeText(props.text)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>
