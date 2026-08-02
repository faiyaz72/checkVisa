<template>
  <section class="max-w-screen-2xl mx-auto px-8 pb-16">
    <Card>
      <CardHeader>
        <div class="flex items-center gap-3 flex-wrap">
          <CardTitle>
            <h2 class="text-2xl">{{ t("glanceSection.title") }}</h2>
          </CardTitle>
          <div class="w-64">
            <CountryCombobox
              v-model="selectedOriginCountry"
              :countries="originCountries"
              :placeholder="t('glanceSection.passport.placeholder')"
              :search-placeholder="
                t('glanceSection.passport.searchPlaceholder')
              "
              clearable
            />
          </div>
        </div>
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
import { buildCountry, Country } from "@/types/country";
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { fetchSupportedOriginCodes } from "@/services/api.service";
import { CountryCombobox } from "@/components/ui/country-combobox";

const originCountries = ref<Country[]>([]);
const selectedOriginCountry = ref<string>("");

const props = defineProps<{
  originCountry?: string;
}>();

onMounted(async () => {
  const codes = await fetchSupportedOriginCodes();
  originCountries.value = codes.map(buildCountry);
});

watch(
  () => props.originCountry,
  (newVal) => {
    selectedOriginCountry.value = newVal ?? "";
  },
);

watch(selectedOriginCountry, (newVal) => {
  console.log(newVal);
});

const { t } = useI18n();
</script>
