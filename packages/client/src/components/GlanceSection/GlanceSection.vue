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
        <div
          ref="scrollContainer"
          class="h-[32rem] overflow-y-scroll overscroll-contain pr-1"
        >
          <div class="grid grid-cols-12 gap-6">
            <DestinationCard
              v-for="item in items"
              :key="item.id"
              class="col-span-12 md:col-span-3"
              :name="buildCountry(item.destinationCountryCode).name"
              :flag-code="buildCountry(item.destinationCountryCode).flagCode"
              :primary-requirement="item.primaryRequirement"
            />
          </div>
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
import { useInfiniteScroll } from "@vueuse/core";
import { fetchSupportedOriginCodes } from "@/services/api.service";
import { getSummary } from "@/services/data.api.service";
import { CountryCombobox } from "@/components/ui/country-combobox";
import type { SummaryItem } from "@/types/summary";

const PAGE_SIZE = 12;

const originCountries = ref<Country[]>([]);
const selectedOriginCountry = ref<string>("");
const items = ref<SummaryItem[]>([]);
const page = ref(0);
const totalPages = ref(0);
const loading = ref(false);
const scrollContainer = ref<HTMLElement | null>(null);

const props = defineProps<{
  originCountry?: string;
}>();

async function fetchPage(nextPage: number, replace: boolean) {
  if (!selectedOriginCountry.value || loading.value) return;
  if (!replace && nextPage > totalPages.value) return;

  loading.value = true;
  try {
    const response = await getSummary({
      originPassportCountryCode: selectedOriginCountry.value,
      page: nextPage,
      pageSize: PAGE_SIZE,
    });
    items.value = replace ? response.data : [...items.value, ...response.data];
    page.value = response.page;
    totalPages.value = response.totalPages;
  } finally {
    loading.value = false;
  }
}

const { reset } = useInfiniteScroll(
  scrollContainer,
  async () => {
    await fetchPage(page.value + 1, false);
  },
  {
    distance: 120,
    canLoadMore: () =>
      !!selectedOriginCountry.value &&
      !loading.value &&
      page.value > 0 &&
      page.value < totalPages.value,
  },
);

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

watch(selectedOriginCountry, async (newVal) => {
  if (!newVal) {
    items.value = [];
    page.value = 0;
    totalPages.value = 0;
    return;
  }
  items.value = [];
  page.value = 0;
  totalPages.value = 0;
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0;
  }
  await fetchPage(1, true);
  reset();
});

const { t } = useI18n();
</script>
