<template>
  <Card class="rounded-4xl border-0 shadow-[0_32px_64px_rgba(16,42,67,0.08)]">
    <CardContent class="p-6 md:p-8 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label
            class="text-[10px] font-bold uppercase tracking-widest text-pp-on-surface-variant px-1"
          >
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
          <label
            class="text-[10px] font-bold uppercase tracking-widest text-pp-on-surface-variant px-1"
          >
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

      <div class="space-y-3">
        <div
          class="flex items-center gap-2 pb-2 border-b border-pp-outline-variant/20"
        >
          <ListFilter
            class="w-4 h-4 text-pp-on-surface-variant"
            :stroke-width="2"
          />
          <span
            class="text-[10px] font-bold uppercase tracking-widest text-pp-on-surface-variant"
          >
            {{ t("searchCard.visaToggles.label") }}
          </span>
        </div>
        <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
          <label
            v-for="visa in visaToggles"
            :key="visa.code"
            :aria-label="t(`searchCard.visaToggles.countries.${visa.code}`)"
            class="flex items-center justify-between px-2 py-2 rounded-lg bg-pp-surface-low cursor-pointer transition-colors hover:bg-pp-surface-container"
          >
            <span
              :class="`fi fi-${visa.code} fis`"
              style="font-size: 1.25rem; border-radius: 4px"
            />
            <Switch v-model:checked="visa.enabled" class="scale-75" />
          </label>
        </div>
      </div>

      <Button
        class="w-full h-14 rounded-xl text-base font-bold text-white border-0 shadow-none hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        style="background: #102a43"
      >
        {{ t("searchCard.cta") }}
        <ArrowRight class="w-4 h-4" :stroke-width="2.5" />
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { ListFilter, ArrowRight } from "lucide-vue-next";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CountryCombobox } from "@/components/ui/country-combobox";
import {
  useOriginCountries,
  useWorldCountries,
} from "@/composables/useCountries";

const { t } = useI18n();

const passportCountry = ref("");
const destination = ref("");

const originCountries = useOriginCountries();
const worldCountries = useWorldCountries();

const visaToggles = ref([
  { code: "us", enabled: false },
  { code: "gb", enabled: false },
  { code: "eu", enabled: false },
  { code: "ae", enabled: false },
  { code: "ca", enabled: false },
  { code: "au", enabled: false },
]);
</script>
