<template>
  <div class="space-y-2">
    <div class="flex items-center gap-2">
      <span
        :class="`fi fi-${flagCode} fis`"
        style="font-size: 1.25rem; border-radius: 4px; flex-shrink: 0"
      />
      <h3 class="font-display text-lg font-semibold text-pp-primary-container">
        {{ name }}
      </h3>
    </div>
    <p class="text-sm text-pp-on-surface-variant">{{ primaryRequirement }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
  flagCode: string;
  primaryRequirement: string;
}>();
</script>
