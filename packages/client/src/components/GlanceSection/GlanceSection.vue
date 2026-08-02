<template>
  <section class="max-w-screen-2xl mx-auto px-8 pb-16">
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 class="text-2xl">{{ t("glanceSection.title") }}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-12 gap-6">
          <div
            v-for="i in 4"
            :key="i"
            class="col-span-12 md:col-span-3 space-y-3"
          >
            <div class="aspect-4/3 rounded-2xl bg-pp-surface-low" />
            <h3
              class="font-display text-lg font-semibold text-pp-primary-container"
            >
              Destination {{ i }}
            </h3>
            <div class="h-5 w-20 rounded-md bg-pp-surface-container" />
          </div>
        </div>
      </CardContent>
    </Card>
  </section>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
