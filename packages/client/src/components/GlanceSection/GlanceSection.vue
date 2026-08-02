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
          <DestinationCard
            v-for="i in 4"
            :key="i"
            class="col-span-12 md:col-span-3"
            :name="`Destination ${i}`"
          />
        </div>
      </CardContent>
    </Card>
  </section>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DestinationCard from "@/components/DestinationCard/DestinationCard.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
