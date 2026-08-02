<template>
  <div class="space-y-3">
    <div class="aspect-4/3 rounded-2xl bg-pp-surface-low" />
    <h3 class="font-display text-lg font-semibold text-pp-primary-container">
      {{ name }}
    </h3>
    <div class="h-5 w-20 rounded-md bg-pp-surface-container" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
}>();
</script>
