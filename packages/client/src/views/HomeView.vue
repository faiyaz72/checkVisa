<template>
  <main>
    <HeroSection @origin-country-change="handleOriginCountryChange" />
    <GlanceSection :origin-country="originCountry" />
  </main>
</template>

<script setup lang="ts">
import HeroSection from "@/components/HeroSection/HeroSection.vue";
import GlanceSection from "@/components/GlanceSection/GlanceSection.vue";
import { ref } from "vue";

const originCountry = ref<string | undefined>(undefined);

const handleOriginCountryChange = (country: string) => {
  originCountry.value = country;
};
</script>
