<script setup lang="ts">
const name = 'home'
</script>

<template>
  <div class="page-heading w-full">
    <div class="border-b-gray-800 dark:border-b-gray-200 border-b-1 flex flex-row text-2xl px-4 py-1.5 items-center">
      <span class="package flex flex-grow font-mono ">
        <a
          href="https://github.com/antfu/vite-plugin-md"
          class="cursor-pointer no-underline hover:(bg-gray-50 rounded) px-2 py-0.75"
        >
          vite-plugin-md (HOME)
        </a>
      </span>
      <span class="npm-info ">
        <a href="https://www.npmjs.com/package/vite-plugin-md">
          <img src="https://img.shields.io/npm/v/vite-plugin-md?color=a1b858)">
        </a>
      </span>
    </div>
  </div>
  <main class="text-base grid grid-cols-12 mt-6 px-4">
    <div class="hidden md:(visible show grid col-span-2)">
      TOC
    </div>
    <div class="grid col-span-12 md:col-span-8 w-full">
      <router-view />
    </div>
  </main>
</template>
