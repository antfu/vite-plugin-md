<script setup lang="ts">
const clipboardAvailable = () => !!navigator?.clipboard?.writeText
const copyToClipboard = (text: string) => {
  navigator?.clipboard?.writeText(text)
}
</script>

<template>
  <div class="cursor-pointer active:text-green-800" data-content="hello world" @click="copyToClipboard('hello world')">
    Hello World
  </div>
</template>
