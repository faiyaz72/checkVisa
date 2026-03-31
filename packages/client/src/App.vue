<script setup lang="ts">
import { RouterView } from "vue-router";
import NavBar from "@/components/NavBar/NavBar.vue";
</script>

<template>
  <div class="min-h-screen bg-pp-surface pt-20">
    <NavBar />
    <RouterView />
  </div>
</template>
