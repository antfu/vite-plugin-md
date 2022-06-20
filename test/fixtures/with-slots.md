---
title: Testing Slots
---

<script setup lang="ts">
defineProps({
    name: { type: String, required: false }
})
</script>

# Hello World

## The Default Slot

<template name="default"></template>

## A Named template

<template name="foobar"></template>
