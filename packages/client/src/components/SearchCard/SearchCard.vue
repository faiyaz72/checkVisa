<template>
  <Card class="rounded-4xl border-0">
    <CardContent class="px-6 pt-4 pb-6 md:px-8 md:pb-8 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="label-pp-overline px-1">
            {{ t("searchCard.passportCountry.label") }}
          </label>
          <CountryCombobox
            v-model="passportCountry"
            :countries="originCountries"
            :placeholder="t('searchCard.passportCountry.placeholder')"
            :search-placeholder="
              t('searchCard.passportCountry.searchPlaceholder')
            "
          />
        </div>

        <div class="space-y-2">
          <label class="label-pp-overline px-1">
            {{ t("searchCard.destination.label") }}
          </label>
          <CountryCombobox
            v-model="destination"
            :countries="worldCountries"
            :placeholder="t('searchCard.destination.placeholder')"
            :search-placeholder="t('searchCard.destination.searchPlaceholder')"
          />
        </div>
      </div>
      <Button
        :disabled="!canSearch"
        class="btn-pp-primary w-full"
        @click="handleSearch"
      >
        {{ t("searchCard.cta") }}
        <ArrowRight class="w-4 h-4" :stroke-width="2.5" />
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { ArrowRight } from "lucide-vue-next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CountryCombobox } from "@/components/ui/country-combobox";
import {
  buildCountry,
  getAllWorldCountries,
  type Country,
} from "@/types/country";
import { fetchSupportedOriginCodes } from "@/services/api.service";
import { getRequirementData } from "@/services/data.api.service";

const { t } = useI18n();

const passportCountry = ref("");
const destination = ref("");
const originCountries = ref<Country[]>([]);
const worldCountries = ref<Country[]>([]);

onMounted(async () => {
  const codes = await fetchSupportedOriginCodes();
  originCountries.value = codes.map(buildCountry);
  worldCountries.value = getAllWorldCountries();
});

const canSearch = computed(
  () => passportCountry.value !== "" && destination.value !== "",
);

async function handleSearch() {
  try {
    const result = await getRequirementData({
      originCountryCode: passportCountry.value,
      destinationCountryCode: destination.value,
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
</script>
