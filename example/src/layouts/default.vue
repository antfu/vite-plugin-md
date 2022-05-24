<script setup lang="ts">
import DarkMode from '~/components/DarkMode.vue'
const name = 'home'
</script>

<template>
  <header class="page-heading fixed top-0 left-0 right-0 max-w-inherit bg-white dark:bg-gray-900 w-full z-10">
    <div class="px-4 py-1.5">
      <div class="border-b-gray-800 dark:border-b-gray-200 border-b-1 flex flex-row text-2xl items-center flex-grow space-x-4 ">
        <span class="package flex flex-grow font-mono">
          <a
            href="/"
            title="go home"
            class="cursor-pointer no-underline hover:(bg-gray-50 rounded) px-2 py-0.75"
          >
            vite-plugin-md
          </a>
        </span>
        <dark-mode />
        <span class="npm-info flex justify-center" title="go to npm">
          <a href="https://www.npmjs.com/package/vite-plugin-md" class="flex">
            <img src="https://img.shields.io/npm/v/vite-plugin-md?color=1c6b48)" class="min-w-88px">
          </a>
        </span>
      </div>
    </div>
  </header>
  <!-- MAIN PAGE LAYOUT -->
  <main class="text-base grid grid-cols-12 mt-6 px-4 relative py-8 z-1">
    <div class="hidden md:(visible show grid col-span-2) relative">
      <div class="fixed">
        TOC
      </div>
    </div>

    <div class="grid col-span-12 md:col-span-8 w-full">
      <router-view />
    </div>
  </main>
</template>
