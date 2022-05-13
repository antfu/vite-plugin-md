<script setup lang="ts">
const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <button class="btn py-0.75 px-2.5 text-xs" @click="toggleDark()">
    <span class="inline-block align-middle dark:i-carbon-moon i-carbon-sun" />
    <span class="pl-2">{{ isDark ? 'Dark' : 'Light' }}</span>
  </button>
</template>
