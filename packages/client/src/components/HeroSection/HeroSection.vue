<script setup lang="ts">
import { useI18n } from "vue-i18n";
import SearchCard from "@/components/SearchCard/SearchCard.vue";

const { t } = useI18n();
</script>

<template>
  <section class="max-w-screen-2xl mx-auto px-8 py-16">
    <div class="grid grid-cols-12 gap-6 items-center">
      <!-- Left: Headline + Search Card -->
      <div class="col-span-12 md:col-span-7 space-y-10">
        <h1
          class="font-display font-extrabold text-5xl md:text-7xl tracking-tighter leading-[0.9]"
        >
          <span class="text-pp-primary-container">{{
            t("hero.headline1")
          }}</span
          ><br />
          <span class="text-pp-secondary">{{ t("hero.headline2") }}</span>
        </h1>
        <SearchCard />
      </div>

      <!-- Right: Hero Image -->
      <div class="hidden md:block md:col-span-5">
        <div
          class="rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_rgba(16,42,67,0.12)] aspect-5/4"
        >
          <img
            src="@/assets/hero.png"
            :alt="t('hero.imageAlt')"
            class="w-full h-full object-cover"
            onerror="
              this.style.background = '#eaeef2';
              this.removeAttribute('src');
            "
          />
        </div>
      </div>
    </div>
  </section>
</template>
