<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const apiMessage = ref<string | null>(null);
const apiError = ref<string | null>(null);

onMounted(async () => {
  try {
    const { data } = await axios.get<{ message: string }>('/api/hello');
    apiMessage.value = data.message;
    apiError.value = null;
  } catch (err) {
    apiError.value = err instanceof Error ? err.message : 'Failed to reach API';
    apiMessage.value = null;
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-8">
    <h1 class="text-3xl font-bold text-emerald-400 mb-6">checkVisa</h1>
    <p class="text-slate-400 mb-4">Frontend → Backend connection:</p>
    <div
      v-if="apiMessage"
      class="rounded-lg bg-emerald-500/20 border border-emerald-500/50 px-6 py-4 text-emerald-300"
    >
      ✓ Success: {{ apiMessage }}
    </div>
    <div
      v-else-if="apiError"
      class="rounded-lg bg-red-500/20 border border-red-500/50 px-6 py-4 text-red-300"
    >
      ✗ Error: {{ apiError }}
    </div>
    <div v-else class="text-slate-500">Loading...</div>
  </div>
</template>
