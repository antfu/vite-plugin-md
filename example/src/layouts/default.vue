<script setup lang="ts">
const name = 'default'
</script>
<template>
  <div class="heading text-2xl border-b-black dark:border-b-white w-full">
    <span class="package">vite-plugin-md</span>
    <span class="npm-info float-right">
      <a href="https://www.npmjs.com/package/vite-plugin-md">
        <img href="https://img.shields.io/npm/v/vite-plugin-md?color=a1b858)">
      </a>
    </span>
    <router-view />
  </div>
</template>
